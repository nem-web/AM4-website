import { useEffect, useMemo, useState } from "react";
import {
  getActiveRoutes,
  getCompanyProfile,
  getFinancialSummary,
  getFleetInventory,
  getRecentTransactions
} from "../services/api";

export function useAirlineData() {
  const [state, setState] = useState({
    loading: true,
    company: null,
    finance: null,
    transactions: [],
    fleet: [],
    routes: []
  });

  useEffect(() => {
    async function load() {
      const [company, finance, transactions, fleet, routes] = await Promise.all([
        getCompanyProfile(),
        getFinancialSummary(),
        getRecentTransactions(),
        getFleetInventory(),
        getActiveRoutes()
      ]);

      setState({ loading: false, company, finance, transactions, fleet, routes });
    }

    load();
  }, []);

  const incomeTrend24h = useMemo(() => {
    if (!state.finance) return [];

    const buckets = [
      { label: "00:00", value: state.finance.income * 0.11 },
      { label: "04:00", value: state.finance.income * 0.09 },
      { label: "08:00", value: state.finance.income * 0.14 },
      { label: "12:00", value: state.finance.income * 0.17 },
      { label: "16:00", value: state.finance.income * 0.19 },
      { label: "20:00", value: state.finance.income * 0.3 }
    ];

    return buckets.map((item) => ({ ...item, value: Math.round(item.value) }));
  }, [state.finance]);

  return { ...state, incomeTrend24h };
}
