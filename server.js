import express from "express";
import { connectDB } from "./config/db.js";
import { runAutomation } from "./lib/am4Bot.js";

const app = express();

const PORT = Number(process.env.PORT || 3000);
const CRON_SECRET = process.env.CRON_SECRET;

app.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});

app.get("/trigger-bot", (req, res) => {
  if (!CRON_SECRET) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const authHeader = req.headers.authorization;
  const headerToken =
    typeof authHeader === "string" && authHeader.slice(0, 7).toLowerCase() === "bearer "
      ? authHeader.slice(7).trim()
    : null;
  const queryToken = req.query.auth;

  if (queryToken !== CRON_SECRET && headerToken !== CRON_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.status(200).json({ status: "Bot started" });

  setImmediate(() => {
    runAutomation().catch((err) => {
      console.error("Background run failed:", err);
    });
  });
});

async function startServer() {
  try {
    // Database connection is initialized once so memory state persists across restarts.
    await connectDB();

    app.listen(PORT, () => {
      console.log(`AM4 bot server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
}

startServer();
