// /app/api/save-outfit/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SavedOutfit from "@/models/SavedOutfit";

// POST /api/save-outfit
export async function POST(req: Request) {
  try {
    const { userId, outfit, score, reason, tips, weather } = await req.json();

    if (!userId || !outfit) {
      return NextResponse.json(
        { error: "Missing userId or outfit data" },
        { status: 400 }
      );
    }

    await connectDB();

    const newOutfit = await SavedOutfit.create({
      userId,
      outfit,
      score,
      reason,
      tips,
      weather,
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "Outfit saved successfully!",
      savedOutfit: newOutfit,
    });
  } catch (error: any) {
    console.error("[save-outfit:POST] Error:", error);
    return NextResponse.json({ error: "Failed to save outfit" }, { status: 500 });
  }
}

// GET /api/save-outfit?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await connectDB();

    const outfits = await SavedOutfit.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json(outfits);
  } catch (error: any) {
    console.error("[save-outfit:GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved outfits" },
      { status: 500 }
    );
  }
}

// DELETE /api/save-outfit?id=...
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await connectDB();
    await SavedOutfit.findByIdAndDelete(id);

    return NextResponse.json({ message: "Outfit deleted" });
  } catch (error: any) {
    console.error("[save-outfit:DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete outfit" }, { status: 500 });
  }
}
