"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LogOut,
  Cloud,
  Shirt,
  Sparkles,
  Settings,
  LayoutGrid,
} from "lucide-react";
import WardrobeManager from "./wardrobe-manager";
import AIOutfitRecommender from "./ai-outfit-recommender";
import SavedOutfits from "./saved-outfits";

export default function Dashboard({
  user,
  onLogout,
}: {
  user: any;
  onLogout?: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<string>("Fetching location...");
  const [loading, setLoading] = useState(false);
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [error, setError] = useState("");

  // ✅ Load on mount
  useEffect(() => {
    fetchWeather();
    fetchWardrobeCount();
    fetchSavedCount();
  }, []);

  // ✅ Fetch wardrobe count
  const fetchWardrobeCount = async () => {
    try {
      const res = await fetch("/api/upload-wardrobe", { method: "GET" });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const userItems = data.filter((item: any) => item.userId === user?.id);
        setWardrobeCount(userItems.length);
      } else setWardrobeCount(0);
    } catch (err) {
      console.error("❌ Wardrobe fetch error:", err);
      setWardrobeCount(0);
      setError("Could not load wardrobe count.");
    }
  };

  // ✅ Fetch saved outfit count
  const fetchSavedCount = async () => {
    try {
      const res = await fetch(`/api/save-outfit?userId=${user.id}`);
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      setSavedCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error("❌ Saved outfits fetch error:", err);
      setSavedCount(0);
    }
  };

  // ✅ Fetch weather
  const fetchWeather = async () => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await fetchWeatherForCoords(pos.coords.latitude, pos.coords.longitude);
          },
          async () => {
            console.warn("Geolocation denied — using fallback city.");
            await fetchDefaultWeather();
          }
        );
      } else {
        await fetchDefaultWeather();
      }
    } catch (err) {
      console.error("Weather error:", err);
      await fetchDefaultWeather();
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherForCoords = async (lat: number, lon: number) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data?.current) throw new Error("Invalid weather data");

      const weatherDesc = getWeatherDescription(data.current.weather_code);
      setWeather({
        ...data.current,
        weather_description: weatherDesc,
      });
      await getLocationName(lat, lon);
    } catch (err) {
      console.error("Weather API error:", err);
      await fetchDefaultWeather();
    }
  };

  const getLocationName = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        "Current Location";
      const country = data.address?.country || "";
      setLocation(`${city}, ${country}`);
    } catch {
      setLocation("Unknown Location");
    }
  };

  const fetchDefaultWeather = async () => {
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=auto"
      );
      const data = await res.json();
      if (!data?.current) throw new Error("Invalid fallback weather data");

      const desc = getWeatherDescription(data.current.weather_code);
      setWeather({
        ...data.current,
        weather_description: desc,
      });
      setLocation("London, UK");
    } catch {
      setWeather({
        temperature_2m: 20,
        weather_code: 1,
        weather_description: "Clear Sky (Offline)",
        relative_humidity_2m: 50,
        wind_speed_10m: 4,
      });
      setLocation("Offline Mode");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return "Clear Sky";
    if ([1, 2].includes(code)) return "Partly Cloudy";
    if (code === 3) return "Overcast";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Drizzle";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Rain Showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ClimaFit
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
            { id: "wardrobe", label: "My Wardrobe", icon: Shirt },
            { id: "saved", label: "Saved Outfits", icon: Sparkles },
            { id: "settings", label: "Settings", icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tabs Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Weather Card */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-8 shadow-xl border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 mb-2">
                    Current Weather in {location}
                  </p>
                  {weather ? (
                    <>
                      <h2 className="text-5xl font-bold mb-2">
                        {Math.round(weather.temperature_2m)}°C
                      </h2>
                      <p className="text-lg text-purple-50">
                        {weather.weather_description}
                      </p>
                      <p className="text-purple-100 mt-2">
                        Humidity: {weather.relative_humidity_2m}% | Wind:{" "}
                        {weather.wind_speed_10m} km/h
                      </p>
                    </>
                  ) : loading ? (
                    <p className="text-purple-100">Loading...</p>
                  ) : (
                    <p className="text-purple-100">Weather unavailable</p>
                  )}
                </div>
                <Cloud className="w-24 h-24 opacity-30" />
              </div>
            </Card>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Shirt className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="text-sm font-semibold text-gray-600">
                  Wardrobe Items
                </h3>
                <p className="text-3xl font-bold">{wardrobeCount}</p>
              </Card>

              <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Sparkles className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="text-sm font-semibold text-gray-600">
                  Saved Outfits
                </h3>
                <p className="text-3xl font-bold">{savedCount}</p>
              </Card>

              <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all">
                <Cloud className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-sm font-semibold text-gray-600">
                  Today's Pick
                </h3>
                <p className="text-3xl font-bold">AI</p>
              </Card>
            </div>

            {/* Recommendations */}
            <AIOutfitRecommender weather={weather} userId={user.id} />

            {error && (
              <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

        {activeTab === "wardrobe" && <WardrobeManager userId={user.id} />}
        {activeTab === "saved" && <SavedOutfits userId={user.id} />}
        {activeTab === "settings" && (
          <Card className="p-8 bg-white border-0 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="space-y-4 text-gray-800">
              <p>Coming soon: personalization, style preferences, and themes!</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
