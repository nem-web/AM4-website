import {
  activeRoutes,
  aircraftPerformance,
  companyData,
  financialSummary24h,
  fleetInventory,
  recentTransactions
} from "../data/mockData";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCompanyProfile() {
  await delay();
  return companyData;
}

export async function getFinancialSummary() {
  await delay();
  return financialSummary24h;
}

export async function getRecentTransactions() {
  await delay();
  return recentTransactions;
}

export async function getFleetInventory() {
  await delay();
  return fleetInventory;
}

export async function getActiveRoutes() {
  await delay();
  return activeRoutes;
}

export async function getAircraftPerformance() {
  await delay();
  return aircraftPerformance;
}
