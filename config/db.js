import mongoose from "mongoose";

let isConnected = false;

const DEFAULT_DB_NAME = "am4-mem";

// Connect once and reuse the same Mongoose connection for all trigger runs.
export async function connectDB() {
  if (isConnected) return mongoose.connection;

  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || DEFAULT_DB_NAME;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI. Set it in your cloud environment variables.");
  }

  await mongoose.connect(mongoUri, {
    dbName,
    serverSelectionTimeoutMS: 30000
  });

  isConnected = true;
  return mongoose.connection;
}
