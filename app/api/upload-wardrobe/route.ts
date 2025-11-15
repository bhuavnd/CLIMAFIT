import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WardrobeItem from "@/models/WardrobeItem";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const userEmail = formData.get("userEmail") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    await connectDB();

    // Convert to buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `wardrobe/${userId}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const { secure_url } = uploadResult as any;

    // 🧠 Step 1: Use Gemini to categorize clothing
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI fashion expert. 
      Categorize the clothing item in this image into one of the following categories:
      - "shirt" (for t-shirts, tops, shirts, sweaters)
      - "pants" (for jeans, trousers, skirts, shorts)
      - "jacket" (for hoodies, blazers, coats)
      - "shoes" (for footwear)
      If it doesn't fit, respond with "misc".
      Image URL: ${secure_url}
      File name: ${file.name}
      Respond ONLY with the category word.
    `;

    let category = "misc";
    try {
      const result = await model.generateContent(prompt);
      const text = (await result.response.text()).trim().toLowerCase();
      if (["shirt", "pants", "jacket", "shoes"].includes(text)) {
        category = text;
      }
    } catch (err) {
      console.error("[Gemini] Categorization error:", err);
    }

    // Step 2: Save item to MongoDB
    const newItem = await WardrobeItem.create({
      userId,
      userEmail,
      name: file.name.replace(/\.[^/.]+$/, ""),
      category,
      color: "mixed",
      imageUrl: secure_url,
      weather_tags: [],
    });

    return NextResponse.json({
      message: "Upload successful",
      item: newItem,
    });
  } catch (error: any) {
    console.error("[upload] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const items = await WardrobeItem.find({});
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("[GET wardrobe] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wardrobe items" },
      { status: 500 }
    );
  }
}
