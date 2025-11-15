// /components/saved-outfits.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Trash2 } from "lucide-react";

export default function SavedOutfits({ userId }: { userId: string }) {
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/save-outfit?userId=${userId}`);
      const data = await res.json();
      setOutfits(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load saved outfits:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const remove = async (id: string) => {
    if (!confirm("Delete this saved outfit?")) return;
    try {
      const res = await fetch(`/api/save-outfit?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      await load();
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white border-0 shadow">
        <p className="text-gray-600">Loading your saved outfits...</p>
      </Card>
    );
  }

  if (!outfits.length) {
    return (
      <Card className="p-12 bg-white border-0 shadow text-center">
        <p className="text-gray-600">No saved outfits yet. Save one from the dashboard!</p>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {outfits.map((o) => (
        <Card key={o._id} className="p-4 bg-white border-0 shadow">
          <div className="grid grid-cols-4 gap-2">
            {(["shirt", "pants", "jacket", "shoes"] as const).map((slot) => {
              const item = o.outfit?.[slot];
              if (!item) return null;
              return (
                <div key={slot} className="relative w-full h-24 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={item.image_url || item.imageUrl || "/placeholder.svg?height=96&width=96"}
                    alt={item.name || slot}
                    fill
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-3">
            <p className="text-sm text-gray-600">Saved: {new Date(o.createdAt).toLocaleString()}</p>
            {o.score && <p className="text-sm text-gray-600">Score: {o.score}</p>}
          </div>

          <div className="mt-3 flex justify-end">
            <Button variant="outline" onClick={() => remove(o._id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
