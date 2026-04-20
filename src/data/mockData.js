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
  { id: "AI-0012", from: "OAHR", to: "VIDP", aircraft: "VT-013-2 (ATR 72-500)", timeLeft: "0h 42m", progress: 81 },
  { id: "AI-0034", from: "VIDP", to: "VIHR", aircraft: "VT-047 (DC-4)", timeLeft: "1h 09m", progress: 63 },
  { id: "AI-0013", from: "UAAA", to: "VIDP", aircraft: "VT-008 (DC-9-10)", timeLeft: "2h 35m", progress: 47 },
  { id: "AI-exmouth", from: "VIDP", to: "YPLM", aircraft: "VT-022 (B737-800)", timeLeft: "5h 18m", progress: 22 },
  { id: "AI-munich", from: "EDDM", to: "VIDP", aircraft: "VT-032 (B737-800)", timeLeft: "4h 03m", progress: 39 },
  { id: "AI-0027", from: "VIDP", to: "LEVX", aircraft: "VT-040 (B737-900)", timeLeft: "3h 27m", progress: 52 }
];

export const aircraftPerformance = [
  { aircraft: "VT-022 (B737-800)", type: "B737-800", lifetimeEarnings: 15420320, last24hEarnings: 528900, flights24h: 6, avgLoadFactor: 84 },
  { aircraft: "VT-032 (B737-800)", type: "B737-800", lifetimeEarnings: 14988420, last24hEarnings: 502110, flights24h: 5, avgLoadFactor: 82 },
  { aircraft: "VT-040 (B737-900)", type: "B737-900", lifetimeEarnings: 11877210, last24hEarnings: 431780, flights24h: 4, avgLoadFactor: 79 },
  { aircraft: "VT-008 (DC-9-10)", type: "DC-9-10", lifetimeEarnings: 6412240, last24hEarnings: 201350, flights24h: 3, avgLoadFactor: 73 },
  { aircraft: "VT-047 (DC-4)", type: "DC-4", lifetimeEarnings: 4789320, last24hEarnings: 169880, flights24h: 3, avgLoadFactor: 70 },
  { aircraft: "VT-013-2 (ATR 72-500)", type: "ATR 72-500", lifetimeEarnings: 3921100, last24hEarnings: 134090, flights24h: 4, avgLoadFactor: 77 }
];
