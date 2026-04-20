import mongoose from "mongoose";

const botMemorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    cash: { type: Number, default: null },
    time: { type: Number, default: null },
    lastFuel: { type: Number, default: null },
    lastCO2: { type: Number, default: null },
    lastBoostReport: { type: Number, default: null }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

export const BotMemory =
  mongoose.models.BotMemory || mongoose.model("BotMemory", botMemorySchema);
