import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ Please define the MONGODB_URI environment variable in .env.local");
}

// 🔹 Global cache (so multiple hot reloads don’t open multiple connections)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * connectDB()
 * Ensures a single Mongoose connection is reused between hot reloads and API calls.
 */
export async function connectDB() {
  if (cached.conn) {
    // ✅ Reuse existing connection
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: "WeatherOutfitDB",
      bufferCommands: false,
    };

    // 🧩 Create a new connection if not cached
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB connected successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB connection failed:", e);
    throw e;
  }

  return cached.conn;
}

/**
 * Optional helper to close the connection manually (useful in scripts/testing)
 */
export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    console.log("🔌 MongoDB connection closed");
  }
}
