import { useMemo, useState } from "react";
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

export default function App() {
  const [activeView, setActiveView] = useState("overview");
  const { loading, company, finance, transactions, fleet, routes, incomeTrend24h } = useAirlineData();

  const viewNode = useMemo(() => {
    if (!company || !finance) return null;
    if (activeView === "finances") return <FinanceView finance={finance} transactions={transactions} />;
    if (activeView === "fleet") return <FleetView fleet={fleet} />;
    if (activeView === "routes") return <RoutesView routes={routes} />;
    return <OverviewView company={company} finance={finance} incomeTrend24h={incomeTrend24h} />;
  }, [activeView, company, finance, fleet, incomeTrend24h, routes, transactions]);

  if (loading) return <Loader />;

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
