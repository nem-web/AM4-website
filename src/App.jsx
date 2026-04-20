import React, { useMemo, useState } from "react";
import FinanceView from "./components/FinanceView";
import FleetView from "./components/FleetView";
import HeaderBar from "./components/HeaderBar";
import OverviewView from "./components/OverviewView";
import RoutesView from "./components/RoutesView";
import Sidebar from "./components/Sidebar";
import { useAirlineData } from "./hooks/useAirlineData";

function Loader() {
  return <div className="flex min-h-screen items-center justify-center text-slate-300">Loading dashboard...</div>;
}

function ErrorState({ message }) {
  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-rose-500/40 bg-rose-950/40 p-6 text-rose-100">
      <h2 className="text-xl font-semibold">Unable to fetch live AM4 data</h2>
      <p className="mt-2 text-sm text-rose-200">{message}</p>
      <p className="mt-3 text-xs text-rose-300">
        Make sure you are logged in to Airline Manager 4 and running this dashboard with the configured proxy/session.
      </p>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState("overview");
  const { loading, error, company, finance, transactions, fleet, routes, aircraftPerformance, incomeTrend24h } =
    useAirlineData();

  const viewNode = useMemo(() => {
    if (!company || !finance) return null;
    if (activeView === "finances") return <FinanceView finance={finance} transactions={transactions} />;
    if (activeView === "fleet") return <FleetView fleet={fleet} aircraftPerformance={aircraftPerformance} />;
    if (activeView === "routes") return <RoutesView routes={routes} aircraftPerformance={aircraftPerformance} />;
    return <OverviewView company={company} finance={finance} incomeTrend24h={incomeTrend24h} />;
  }, [activeView, aircraftPerformance, company, finance, fleet, incomeTrend24h, routes, transactions]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  return (
    <main className="mx-auto max-w-[1600px] p-4 lg:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <Sidebar activeView={activeView} onChange={setActiveView} />
        <section>
          <HeaderBar company={company} balance={finance.balance} />
          {viewNode}
        </section>
      </div>
    </main>
  );
}
