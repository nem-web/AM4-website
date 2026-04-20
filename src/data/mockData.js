export const companyData = {
  id: 26060718,
  name: "Airways Snake3265",
  subsidiary: "NemWeb Cargo",
  rank: "25,188",
  level: 26,
  reputation: { airline: 55, cargo: 49 },
  fleetCount: 34,
  routesCount: 34,
  pax: { economy: 74832, business: 24904, first: 10514 },
  cargo: { large: "933,000 Lbs", heavy: "399,000 Lbs" }
};

export const financialSummary24h = {
  balance: 4726352,
  paxPoints: 1250,
  income: 7158097,
  expenses: 2431745,
  netResult: 4726352,
  breakdown: {
    fuelExpenses: 1320000,
    routeFees: 31004,
    acOrders: 609718,
    ticketIncome: 7158097
  }
};

export const recentTransactions = [
  { time: "8 mins ago", type: "income", desc: "1 routes departed", amount: 109620 },
  { time: "12 mins ago", type: "income", desc: "2 routes departed", amount: 59878 },
  { time: "1 hour ago", type: "income", desc: "1 routes departed", amount: 37815 },
  { time: "1 hour ago", type: "income", desc: "3 routes departed", amount: 204167 },
  { time: "3 hours ago", type: "expense", desc: "2,000,000 Lbs purchased", amount: -720000 },
  { time: "6 hours ago", type: "income", desc: "19 routes departed", amount: 3418444 },
  { time: "9 hours ago", type: "expense", desc: "Hangar construction", amount: -471023 },
  { time: "9 hours ago", type: "expense", desc: "A/C Purchased", amount: -609718 }
];

export const fleetInventory = [
  { type: "B737-800", count: 14, manufacturer: "Boeing", role: "PAX" },
  { type: "B737-900", count: 9, manufacturer: "Boeing", role: "PAX" },
  { type: "DC-9-10", count: 3, manufacturer: "McDonnell Douglas", role: "PAX" },
  { type: "DC-4", count: 2, manufacturer: "McDonnell Douglas", role: "PAX" },
  { type: "ATR 72-500", count: 1, manufacturer: "Aerospatiale", role: "PAX" },
  { type: "DC-6B", count: 1, manufacturer: "McDonnell Douglas", role: "PAX" },
  { type: "B737-500", count: 1, manufacturer: "Boeing", role: "PAX" },
  { type: "Bombardier Challenger 605-VIP", count: 1, manufacturer: "Bombardier", role: "VIP" },
  { type: "A310-300F", count: 1, manufacturer: "Airbus", role: "Cargo" },
  { type: "Cessna Citation X- VIP", count: 1, manufacturer: "Cessna", role: "VIP" }
];

export const activeRoutes = [
  { id: "AI-0012", route: "OAHR - VIDP", aircraft: "VT-013-2 (ATR 72-500)" },
  { id: "AI-0034", route: "VIDP - VIHR", aircraft: "VT-047 (DC-4)" },
  { id: "AI-0013", route: "UAAA - VIDP", aircraft: "VT-008 (DC-9-10)" },
  { id: "AI-exmouth", route: "VIDP - YPLM", aircraft: "VT-022 (B737-800)" },
  { id: "AI-munich", route: "EDDM - VIDP", aircraft: "VT-032 (B737-800)" },
  { id: "AI-0027", route: "VIDP - LEVX", aircraft: "VT-040 (B737-900)" }
];
