import mongoose, { Schema, models } from "mongoose";

const WardrobeItemSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "uncategorized",
      trim: true,
    },
    color: {
      type: String,
      default: "mixed",
      trim: true,
    },
    temperatureRange: {
      type: String,
      default: "moderate",
    },
    imageUrl: {
      type: String,
      required: true,
    },
    weather_tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const WardrobeItem =
  models.WardrobeItem || mongoose.model("WardrobeItem", WardrobeItemSchema);

export default WardrobeItem;
