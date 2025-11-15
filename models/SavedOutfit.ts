// /models/SavedOutfit.ts
import mongoose from "mongoose";

const SavedOutfitSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },

    outfit: {
      shirt: { type: Object, default: null },
      pants: { type: Object, default: null },
      jacket: { type: Object, default: null },
      shoes: { type: Object, default: null },
    },

    score: { type: String, default: "" },
    reason: { type: String, default: "" },
    tips: { type: String, default: "" },
    weather: { type: Object, default: {} },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.SavedOutfit ||
  mongoose.model("SavedOutfit", SavedOutfitSchema);
