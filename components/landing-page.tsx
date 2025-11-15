"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Cloud, Sparkles, Zap } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Simple Local Auth System
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password)
        throw new Error("Please enter email and password");

      // Fake local user system
      const fakeUser = {
        id: email.replace(/[@.]/g, "-"),
        email,
      };

      localStorage.setItem("user", JSON.stringify(fakeUser));
      setShowAuthModal(false);

      // ✅ FIXED: redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* ---------------- HEADER ---------------- */}
        <header className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              OutfitWeather
            </h1>
          </div>

          <Button
            onClick={() => {
              setShowAuthModal(true);
              setIsSignUp(false);
            }}
            variant="outline"
            className="rounded-full"
          >
            Sign In
          </Button>
        </header>

        {/* ---------------- HERO SECTION ---------------- */}
        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Never Wear The Wrong Outfit Again
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Get AI-powered outfit recommendations based on real-time
                  weather. Upload your wardrobe and let our smart system suggest
                  the perfect outfit every single day.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsSignUp(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-8 py-6 text-lg font-semibold hover:shadow-lg transition-all"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg font-semibold bg-transparent"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right illustration */}
            <div className="relative h-96 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Cloud className="w-24 h-24 mx-auto text-purple-400 opacity-50 animate-bounce" />
                  <p className="text-gray-600 font-semibold">
                    Perfect Outfits, Perfect Weather
                  </p>
                </div>
              </div>

              <div className="absolute top-8 right-8 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <span className="text-4xl">☀️</span>
              </div>

              <div className="absolute bottom-8 left-8 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <span className="text-4xl">❄️</span>
              </div>
            </div>
          </div>

          {/* ---------------- FEATURES SECTION ---------------- */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="p-8 bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
              <Sparkles className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Smart Recommendations</h3>
              <p className="text-gray-600">
                AI-powered suggestions based on weather, temperature, humidity,
                and your style preferences.
              </p>
            </Card>

            <Card className="p-8 bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">3D Visualization</h3>
              <p className="text-gray-600">
                See how your outfit looks with an interactive 3D avatar wearing
                your clothes.
              </p>
            </Card>

            <Card className="p-8 bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 duration-300">
              <Cloud className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Real-Time Weather</h3>
              <p className="text-gray-600">
                Automatic location detection and instant outfit suggestions.
              </p>
            </Card>
          </div>
        </main>
      </div>

      {/* ---------------- AUTH MODAL ---------------- */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl relative">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>

              <form onSubmit={handleAuth} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg py-3 font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-gray-600 hover:text-purple-600 transition"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>

              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
