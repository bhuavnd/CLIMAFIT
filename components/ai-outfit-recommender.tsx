// /components/ai-outfit-recommender.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Heart } from "lucide-react";
import Image from "next/image";

export default function AIOutfitRecommender({
  weather,
  userId,
}: {
  weather: any;
  userId: string;
}) {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (weather) generateRecommendation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather]);

  const generateRecommendation = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recommend-outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          weather: weather?.weather_code,
          temperature: Math.round(weather?.temperature_2m ?? 20),
        }),
      });
      if (!res.ok) throw new Error("Failed to get recommendation");
      const data = await res.json();
      setRecommendation(data);
    } catch (e) {
      console.error("[AI Outfit] error:", e);
      setError(
        "Could not generate recommendation. Make sure you have items in your wardrobe!"
      );
    } finally {
      setLoading(false);
    }
  };

  const saveOutfit = async () => {
    if (!recommendation?.outfit) return alert("No outfit to save yet.");
    try {
      setSaving(true);
      const res = await fetch("/api/save-outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          outfit: recommendation.outfit,
          score: recommendation.score,
          reason: recommendation.reason,
          tips: recommendation.tips,
          weather,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      alert("Outfit saved successfully!");
    } catch (err) {
      console.error("Save outfit error:", err);
      alert("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Smart Outfit Recommendation</h2>
            <p className="text-sm text-gray-600">Matched perfectly to today’s weather</p>
          </div>
        </div>
        <Button
          onClick={generateRecommendation}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-lg transition-all"
        >
          {loading ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {!recommendation ? (
        <Card className="p-12 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl text-center">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-700 font-semibold mb-2">Loading your personalized recommendation...</p>
          <p className="text-gray-600 text-sm">Analyzing weather and your wardrobe</p>
        </Card>
      ) : (
        <Card className="overflow-hidden shadow-xl border-0 bg-white hover:shadow-2xl transition-all">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Today&apos;s Perfect Outfit</h3>
                <p className="text-purple-100">
                  Based on {recommendation.wardrobe_size} wardrobe items
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{recommendation.score}</div>
                <p className="text-purple-100 text-sm">Match Score</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {recommendation.outfit && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Your Outfit Items</h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(["shirt", "pants", "jacket", "shoes"] as const).map((slot) => {
                    const item = recommendation.outfit[slot];
                    if (!item) return null;
                    return (
                      <div
                        key={slot}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="relative w-full h-40 bg-gray-100">
                          <Image
                            src={item.image_url || item.imageUrl || "/placeholder.svg?height=160&width=160"}
                            alt={item.name || slot}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {item.name || "(unnamed)"}
                          </p>
                          <p className="text-xs text-gray-600 capitalize">
                            {item.category || slot}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.color || "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Recommended Outfit</h4>
              <p className="text-gray-700 leading-relaxed bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
                {recommendation.recommendation}
              </p>
            </div>

            {recommendation.reason && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">Why It Works</h4>
                <p className="text-gray-700 leading-relaxed">{recommendation.reason}</p>
              </div>
            )}

            {recommendation.tips && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">Styling Tips</h4>
                <p className="text-gray-700 leading-relaxed">{recommendation.tips}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-lg transition-all"
                onClick={saveOutfit}
                disabled={saving}
              >
                <Heart className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Outfit"}
              </Button>

              <Button
                onClick={generateRecommendation}
                disabled={loading}
                variant="outline"
                className="flex-1 rounded-full bg-white"
              >
                {loading ? "Analyzing..." : "Get Another Suggestion"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
