import React from "react";

const money = (n) => `$${Number(n).toLocaleString()}`;

export default function RoutesView({ routes, aircraftPerformance }) {
  const top24h = [...aircraftPerformance].sort((a, b) => b.last24hEarnings - a.last24hEarnings).slice(0, 3);
  const totalLifetime = aircraftPerformance.reduce((sum, aircraft) => sum + aircraft.lifetimeEarnings, 0);
  const avgRouteCompletion = routes.length
    ? Math.round(routes.reduce((sum, route) => sum + route.progress, 0) / routes.length)
    : 0;

  return (
    <section className="space-y-4">
      <div className="card p-4">
        <h3 className="mb-4 text-lg font-semibold">Active Routes with Time Remaining</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-2">Route ID</th>
                <th>From</th>
                <th>To</th>
                <th>Assigned Aircraft</th>
                <th>Time Left</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {routes.length === 0 ? (
                <tr className="border-t border-slate-800">
                  <td colSpan={6} className="py-3 text-slate-400">No active routes found.</td>
                </tr>
              ) : (
                routes.map((route) => (
                  <tr key={route.id} className="border-t border-slate-800">
                    <td className="py-2 font-medium text-sky-300">{route.id}</td>
                    <td>{route.from}</td>
                    <td>{route.to}</td>
                    <td>{route.aircraft}</td>
                    <td className="font-medium text-amber-300">{route.timeLeft}</td>
                    <td className="min-w-40">
                      <div className="h-2 w-full rounded-full bg-slate-800">
                        <div className="h-2 rounded-full bg-sky-400" style={{ width: `${route.progress}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{route.progress}% complete</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-3 text-lg font-semibold">Top Performers (24h)</h3>
          <div className="space-y-2">
            {top24h.map((aircraft) => (
              <div key={aircraft.aircraft} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="font-medium">{aircraft.aircraft}</p>
                <p className="text-sm text-emerald-300">24h Earnings: {money(aircraft.last24hEarnings)}</p>
                <p className="text-xs text-slate-400">Load Factor: {aircraft.avgLoadFactor}% • Flights: {aircraft.flights24h}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-lg font-semibold">Advanced Ops Insights</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-400">Fleet lifetime earnings tracked:</span>{" "}
              <span className="font-semibold text-sky-300">{money(totalLifetime)}</span>
            </li>
            <li className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-400">Routes nearing arrival (&lt; 1h):</span>{" "}
              <span className="font-semibold text-amber-300">{routes.filter((r) => r.timeLeft.startsWith("0h")).length}</span>
            </li>
            <li className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <span className="text-slate-400">Average route completion:</span>{" "}
              <span className="font-semibold text-emerald-300">
                {avgRouteCompletion}%
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
