import mongoose from "mongoose";

let isConnected = false;

// Connect once and reuse the same Mongoose connection for all trigger runs.
export async function connectDB() {
  if (isConnected) return mongoose.connection;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000
  });

  isConnected = true;
  return mongoose.connection;
}
