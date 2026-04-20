import { fetchDashboardData } from "./_lib/am4.js";

export default async function handler(_req, res) {
  try {
    const data = await fetchDashboardData();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch AM4 dashboard data" });
  }
}

export const config = {
  runtime: "nodejs",
  maxDuration: 60
};
