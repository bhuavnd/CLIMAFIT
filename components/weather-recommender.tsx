"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Heart } from "lucide-react"
import Image from "next/image"

export default function WeatherRecommender({
  weather,
  userId,
  onItemsChanged,
}: {
  weather: any
  userId: string
  onItemsChanged?: () => void
}) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (weather) {
      generateRecommendations()
    }
  }, [weather])

  const generateRecommendations = async () => {
    setLoading(true)
    try {
      const weatherCondition = getWeatherCondition(weather.weather_code)
      const temperature = Math.round(weather.temperature_2m)

      // ✅ Fetch items from MongoDB via API route
      const response = await fetch("/api/upload-wardrobe")
      if (!response.ok) throw new Error("Failed to fetch wardrobe items")
      const data = await response.json()

      const items = data.filter((item: any) => item.userId === userId)

      if (!items || items.length === 0) {
        setRecommendations([])
        setLoading(false)
        return
      }

      // Filter by weather condition
      const matchingItems = items.filter((item: any) => {
        if (!item.weather_tags || item.weather_tags.length === 0) return true
        return item.weather_tags.includes(weatherCondition)
      })

      // Group by category
      const grouped = {
        shirt: matchingItems.filter((i: any) => i.category === "shirt"),
        pants: matchingItems.filter((i: any) => i.category === "pants"),
        jacket: matchingItems.filter((i: any) => i.category === "jacket"),
        shoes: matchingItems.filter((i: any) => i.category === "shoes"),
      }

      // Build random outfits
      const outfits = []
      const maxCombos = Math.min(3, Math.max(1, Math.floor(items.length / 3)))

      for (let i = 0; i < maxCombos; i++) {
        if (grouped.shirt.length > 0 && grouped.pants.length > 0 && grouped.shoes.length > 0) {
          const outfit = {
            shirt: grouped.shirt[i % grouped.shirt.length],
            pants: grouped.pants[i % grouped.pants.length],
            jacket: grouped.jacket.length > 0 ? grouped.jacket[i % grouped.jacket.length] : null,
            shoes: grouped.shoes[i % grouped.shoes.length],
            score: 75 + Math.random() * 25,
          }
          outfits.push(outfit)
        }
      }

      setRecommendations(outfits)
    } catch (error) {
      console.error("Error generating recommendations:", error)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  const getWeatherCondition = (code: number): string => {
    if (code === 0 || code === 1) return "sunny"
    if (code === 2 || code === 3) return "cloudy"
    if (code >= 45 && code <= 48) return "rainy"
    if (code >= 71 && code <= 77) return "cold"
    if (code >= 80 && code <= 82) return "rainy"
    return "neutral"
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
        </div>
        <Button
          onClick={generateRecommendations}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full"
        >
          {loading ? "Generating..." : "Refresh"}
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card className="p-12 bg-white shadow-lg border-0 text-center">
          <p className="text-gray-600 text-lg">Add clothing items to your wardrobe to get recommendations!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {recommendations.map((outfit, idx) => (
            <Card
              key={idx}
              className="overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 bg-white border-0 group"
            >
              {/* Outfit Preview */}
              <div className="grid grid-cols-2 gap-2 p-4 bg-gradient-to-br from-purple-50 to-blue-50 h-48">
                {outfit.shirt && (
                  <div className="relative bg-white rounded-lg overflow-hidden">
                    <Image
                      src={outfit.shirt.imageUrl || "/placeholder.svg?height=100&width=100"}
                      alt="shirt"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {outfit.pants && (
                  <div className="relative bg-white rounded-lg overflow-hidden">
                    <Image
                      src={outfit.pants.imageUrl || "/placeholder.svg?height=100&width=100"}
                      alt="pants"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {outfit.jacket && (
                  <div className="relative bg-white rounded-lg overflow-hidden">
                    <Image
                      src={outfit.jacket.imageUrl || "/placeholder.svg?height=100&width=100"}
                      alt="jacket"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {outfit.shoes && (
                  <div className="relative bg-white rounded-lg overflow-hidden">
                    <Image
                      src={outfit.shoes.imageUrl || "/placeholder.svg?height=100&width=100"}
                      alt="shoes"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-600">Match Score</span>
                  <span className="text-lg font-bold text-purple-600">{Math.round(outfit.score)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${outfit.score}%` }}
                  />
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold">Shirt:</span> {outfit.shirt?.name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Pants:</span> {outfit.pants?.name}
                  </p>
                  {outfit.jacket && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Jacket:</span> {outfit.jacket?.name}
                    </p>
                  )}
                  <p className="text-gray-700">
                    <span className="font-semibold">Shoes:</span> {outfit.shoes?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-full bg-transparent">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full">
                    Wear Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
