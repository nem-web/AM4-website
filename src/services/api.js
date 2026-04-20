let dashboardCache = null;

export async function getDashboardData(force = false) {
  if (!force && dashboardCache) return dashboardCache;

  const res = await fetch("/api/dashboard", { method: "GET" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Dashboard API failed (${res.status})`);
  }

  dashboardCache = await res.json();
  return dashboardCache;
}

export async function getCompanyProfile() {
  return (await getDashboardData()).company;
}

export async function getFinancialSummary() {
  return (await getDashboardData()).finance;
}

export async function getRecentTransactions() {
  return (await getDashboardData()).transactions;
}

export async function getFleetInventory() {
  return (await getDashboardData()).fleet;
}

export async function getActiveRoutes() {
  return (await getDashboardData()).routes;
}

export async function getAircraftPerformance() {
  return (await getDashboardData()).aircraftPerformance;
}
