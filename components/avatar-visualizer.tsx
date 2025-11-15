"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"
import Image from "next/image"

export default function AvatarVisualizer({ userId }: { userId: string }) {
  const [outfitItems, setOutfitItems] = useState<any[]>([])
  const [avatarStyle, setAvatarStyle] = useState("style1")
  const [isRotating, setIsRotating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) fetchOutfitItems()
  }, [userId])

  // ✅ Fetch outfit items from MongoDB (via your /api/upload-wardrobe route)
  const fetchOutfitItems = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/upload-wardrobe")
      const data = await response.json()

      const userItems = data.filter((item: any) => item.userId === userId)

      if (userItems && userItems.length > 0) {
        const categoryMap: Record<string, any> = {}

        interface WardrobeItem {
          _id: string;
          category: string;
          name: string;
          imageUrl: string;
          userId: string;
          weather_tags?: string[];
        }

                userItems.forEach((item: WardrobeItem) => {
                  if (!categoryMap[item.category]) {
                    categoryMap[item.category] = item;
                  }
                });

        const organized = [
          categoryMap["shirt"] || null,
          categoryMap["pants"] || null,
          categoryMap["jacket"] || null,
          categoryMap["shoes"] || null,
        ].filter(Boolean)

        setOutfitItems(organized)
      } else {
        setOutfitItems([])
      }
    } catch (error) {
      console.error("Error fetching wardrobe items:", error)
      setOutfitItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleRotate = () => {
    setIsRotating(true)
    setTimeout(() => setIsRotating(false), 600)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">3D Avatar Visualization</h2>

      {loading ? (
        <Card className="p-12 bg-white shadow-lg border-0 text-center">
          <p className="text-gray-600">Loading avatar...</p>
        </Card>
      ) : outfitItems.length === 0 ? (
        <Card className="p-12 bg-white shadow-lg border-0 text-center">
          <p className="text-gray-600 text-lg">Add clothing items to see your avatar!</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Avatar View */}
          <Card className="p-8 bg-gradient-to-br from-purple-100 to-blue-100 shadow-lg border-0 h-auto min-h-96 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative w-full flex flex-col items-center gap-4 py-8">
              {/* Head */}
              <div className="w-20 h-20 bg-yellow-200 rounded-full border-4 border-yellow-300 shadow-lg" />

              {/* Outfit Layers */}
              <div
                className={`flex flex-col items-center gap-3 transition-transform duration-500 ${
                  isRotating ? "scale-95 rotate-180" : ""
                }`}
              >
                {outfitItems.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="relative w-28 h-24 bg-white rounded-lg overflow-hidden shadow-md"
                  >
                    <Image
                      src={item.imageUrl || "/placeholder.svg?height=96&width=112"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Rotate Button */}
              <Button
                onClick={handleRotate}
                disabled={isRotating}
                className="absolute bottom-8 bg-white text-purple-600 hover:bg-gray-50 rounded-full shadow-lg mt-6"
              >
                <RotateCw className={`w-5 h-5 transition-transform ${isRotating ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </Card>

          {/* Outfit Details */}
          <Card className="p-8 bg-white shadow-lg border-0 space-y-6">
            <h3 className="text-2xl font-bold">Current Outfit</h3>

            {outfitItems.length === 0 ? (
              <p className="text-gray-600">No items in outfit yet</p>
            ) : (
              <div className="space-y-4">
                {outfitItems.map((item: any) => (
                  <div
                    key={item._id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl || "/placeholder.svg?height=64&width=64"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.weather_tags && item.weather_tags.length > 0 ? (
                            item.weather_tags.map((tag: string) => (
                              <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full py-3 font-semibold">
              Try Different Combinations
            </Button>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white shadow-lg border-0">
          <h3 className="text-lg font-bold mb-4">Outfit Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Style Match</span>
              <span className="font-bold text-purple-600">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: "92%" }} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg border-0">
          <h3 className="text-lg font-bold mb-4">Comfort Rating</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Weather Fit</span>
              <span className="font-bold text-blue-600">88%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "88%" }} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
