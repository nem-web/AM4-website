import { waitUntil } from "@vercel/functions";
import { runAutomation } from "../lib/am4Bot.js";

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = req.headers.authorization;
  const isVercelCron = authHeader === `Bearer ${cronSecret}`;
  const isManualQuery = req.query?.auth === cronSecret;

  return isVercelCron || isManualQuery;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  waitUntil(
    runAutomation().catch((err) => {
      console.error("Background run failed:", err);
    })
  );

  return res.status(200).json({ status: "Bot started" });
}

export const config = {
  runtime: "nodejs",
  maxDuration: 300
};
