import { waitUntil } from "@vercel/functions";
import { runAutomation } from "../lib/am4Bot.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  waitUntil(
    runAutomation().catch((err) => {
      console.error("Auto trigger failed:", err);
    })
  );

  return res.status(200).send("AM4 bot auto-triggered in background.");
}

export const config = {
  runtime: "nodejs",
  maxDuration: 300
};
