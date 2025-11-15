import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WardrobeItem from "@/models/WardrobeItem";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Initialize Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Weather code → conditions ---
const weatherConditionMap: Record<number, string[]> = {
  0: ["sunny", "hot"],
  1: ["sunny", "warm"],
  2: ["cloudy", "mild"],
  3: ["cool"],
  45: ["foggy"],
  48: ["foggy"],
  51: ["light_rain"],
  53: ["light_rain"],
  55: ["light_rain"],
  61: ["rain"],
  63: ["rain"],
  65: ["rain"],
  71: ["cold", "snow"],
  73: ["cold", "snow"],
  75: ["cold", "snow"],
  80: ["rainy"],
  81: ["heavy_rain"],
  82: ["heavy_rain"],
  95: ["stormy"],
  96: ["stormy"],
  99: ["stormy"],
};

// --- Guess category from name or image ---
function guessCategory(item: any): string {
  const name = (item.name || "").toLowerCase();
  const img = (item.imageUrl || item.image_url || "").toLowerCase();

  // ✅ Detect topwear
  if (
    /shirt|tshirt|tee|top|blouse|kurta|sweater/.test(name) ||
    /shirt|tshirt|top/.test(img)
  )
    return "shirt";

  // ✅ Detect bottomwear
  if (
    /pant|jean|trouser|short|skirt|bottom/.test(name) ||
    /pant|jean|trouser/.test(img)
  )
    return "pants";

  // ✅ Detect outerwear
  if (/jacket|coat|hoodie|blazer|sweatshirt/.test(name) || /jacket/.test(img))
    return "jacket";

  // ✅ Detect footwear
  if (/shoe|sandal|boot|sneaker|loafer/.test(name) || /shoe/.test(img))
    return "shoes";

  return "misc";
}


export async function POST(req: Request) {
  try {
    const { userId, weather, temperature } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await connectDB();
    const items = await WardrobeItem.find({ userId });

    if (!items || items.length === 0) {
      return NextResponse.json({
        recommendation: "Your wardrobe is empty. Add items to get started!",
        outfit: null,
        score: "0/10",
        wardrobe_size: 0,
      });
    }

    const weatherTags = weatherConditionMap[weather] || ["mild"];
    const isCold = temperature < 12;
    const isHot = temperature > 28;
    const isRainy = weatherTags.includes("rain") || weatherTags.includes("heavy_rain");

    // Group by category
    const grouped = {
      shirt: [] as any[],
      pants: [] as any[],
      jacket: [] as any[],
      shoes: [] as any[],
      misc: [] as any[],
    };

    for (const item of items) {
      const cat = (item.category?.toLowerCase() || guessCategory(item)) as keyof typeof grouped;
      if (grouped[cat]) grouped[cat].push(item);
      else grouped.misc.push(item);
    }

    // Score items by how weather-appropriate they are
    const scoreItem = (item: any): number => {
      let score = 1;
      const tags = item.weather_tags || [];
      weatherTags.forEach((t) => {
        if (tags.includes(t)) score += 2;
      });
      if (isCold && tags.includes("warm")) score += 2;
      if (isHot && tags.includes("light")) score += 2;
      if (isRainy && tags.includes("waterproof")) score += 3;
      return score;
    };

    const pickBest = (arr: any[]) => (arr.length ? arr.sort((a, b) => scoreItem(b) - scoreItem(a))[0] : null);

    const bestShirt = pickBest(grouped.shirt);
    const bestPants = pickBest(grouped.pants);
    const bestJacket = pickBest(grouped.jacket);
    const bestShoes = pickBest(grouped.shoes);

    // Create a minimal outfit (fallback if few items)
    const allAvailable = [...grouped.shirt, ...grouped.pants, ...grouped.jacket, ...grouped.shoes, ...grouped.misc];
    const randomFallback = () => allAvailable[Math.floor(Math.random() * allAvailable.length)];

    const outfit = {
      shirt: bestShirt || randomFallback(),
      pants: bestPants || randomFallback(),
      jacket: isCold ? bestJacket || randomFallback() : null,
      shoes: isRainy ? bestShoes || randomFallback() : null,
    };

    const parts = Object.values(outfit)
      .filter(Boolean)
      .map((it: any) => `${it.color || "a"} ${it.name}`)
      .join(", ");

    const avgScore =
      Object.values(outfit)
        .filter(Boolean)
        .reduce((sum, it: any) => sum + scoreItem(it), 0) /
      Math.max(1, Object.values(outfit).filter(Boolean).length);

    const scorePercentage = Math.min(10, Math.round((avgScore / 5) * 10));

    let recommendation = `Based on today's weather, wear ${parts}.`;

    // --- Use Gemini AI to refine recommendation ---
    try {
      const prompt = `
        You are a personal fashion assistant.
        The current temperature is ${temperature}°C and weather conditions are ${weatherTags.join(", ")}.
        The user has these wardrobe items: ${items
          .map((it: any) => `${it.name} (${it.category || "uncategorized"})`)
          .join(", ")}.
        Suggest the best outfit combination and explain briefly why it fits the weather.
      `;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();

      if (aiResponse && aiResponse.length > 20) {
        recommendation = aiResponse;
      }
    } catch (aiError: any) {
      console.warn("[AI Recommendation Fallback]", aiError.message);
    }

    const reason = `This outfit suits ${
      isCold ? "cold" : isHot ? "hot" : isRainy ? "rainy" : "mild"
    } weather conditions.`;
    const tips = isRainy
      ? "Don’t forget a waterproof layer or shoes."
      : isCold
      ? "Layer up with your warmest jacket."
      : isHot
      ? "Choose breathable fabrics like cotton."
      : "A balanced outfit for mild temperatures.";

    return NextResponse.json({
      recommendation,
      outfit,
      score: `${scorePercentage}/10`,
      wardrobe_size: items.length,
      reason,
      tips,
    });
  } catch (error: any) {
    console.error("[recommend-outfit] Error:", error);
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 });
  }
}
