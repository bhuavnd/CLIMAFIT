"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Trash2, Plus } from "lucide-react"
import Image from "next/image"

const CATEGORIES = ["shirt", "pants", "jacket", "shoes", "accessories"]
const COLORS = ["Red", "Blue", "Green", "Black", "White", "Gray", "Purple", "Pink", "Brown", "Navy"]
const WEATHER_TAGS = ["cold", "rainy", "hot", "windy", "sunny", "neutral"]

export default function WardrobeManager({ userId }: { userId: string }) {
  const [items, setItems] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    category: "shirt",
    color: "Black",
    weather_tags: [] as string[],
  })

  useEffect(() => {
    // Load user email from localStorage fake auth
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserEmail(user.email)
    }

    fetchItems()
  }, [userId])

  // ✅ Fetch wardrobe items from MongoDB via your API route
  const fetchItems = async () => {
    try {
      const response = await fetch("/api/upload-wardrobe")
      if (!response.ok) throw new Error("Failed to fetch wardrobe items")

      const data = await response.json()
      const userItems = data.filter((item: any) => item.userId === userId)
      setItems(userItems)
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }

  // ✅ Add item (upload image + save metadata)
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("file", selectedFile)
      formDataToSend.append("userId", userId)
      formDataToSend.append("userEmail", userEmail)
      formDataToSend.append("name", formData.name)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("color", formData.color)
      formDataToSend.append("weather_tags", JSON.stringify(formData.weather_tags))

      const uploadResponse = await fetch("/api/upload-wardrobe", {
        method: "POST",
        body: formDataToSend,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || "Upload failed")
      }

      setFormData({ name: "", category: "shirt", color: "Black", weather_tags: [] })
      setSelectedFile(null)
      setShowAddModal(false)
      fetchItems()
    } catch (error) {
      console.error("Error adding item:", error)
      alert("Error adding item: " + String(error))
    } finally {
      setLoading(false)
    }
  }

  // ✅ Delete item from MongoDB
  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/upload-wardrobe?id=${itemId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete item")
      fetchItems()
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">My Wardrobe ({items.length} items)</h2>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Wardrobe Grid */}
      {items.length === 0 ? (
        <Card className="p-12 bg-white shadow-lg border-0 text-center">
          <p className="text-gray-600 text-lg mb-4">Your wardrobe is empty!</p>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Item
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card
              key={item._id}
              className="overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white border-0 group"
            >
              <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                <Image
                  src={item.imageUrl || "/placeholder.svg?height=192&width=192"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.weather_tags && item.weather_tags.length > 0 ? (
                    item.weather_tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">untagged</span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteItem(item._id)}
                  className="mt-3 w-full p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl border-0 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Add Clothing Item</h2>

              <form onSubmit={handleAddItem} className="space-y-4">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition cursor-pointer">
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : "Click to upload image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      required
                    />
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Item name (e.g., Blue T-Shirt)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  required
                />

                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                >
                  {COLORS.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weather Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {WEATHER_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            weather_tags: formData.weather_tags.includes(tag)
                              ? formData.weather_tags.filter((t) => t !== tag)
                              : [...formData.weather_tags, tag],
                          })
                        }
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                          formData.weather_tags.includes(tag)
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg py-3 font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Item"}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
