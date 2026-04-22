import React, { useMemo, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const manufacturerColors = ["#0ea5e9", "#22c55e", "#a855f7", "#f59e0b", "#ef4444"];

const money = (n) => `$${Number(n).toLocaleString()}`;

export default function FleetView({ fleet, aircraftPerformance }) {
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(
    () => (roleFilter === "all" ? fleet : fleet.filter((a) => a.role.toLowerCase() === roleFilter)),
    [fleet, roleFilter]
  );

  const byManufacturer = useMemo(() => {
    const counts = filtered.reduce((acc, aircraft) => {
      acc[aircraft.manufacturer] = (acc[aircraft.manufacturer] || 0) + aircraft.count;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  return (
    <section className="space-y-4">
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Current Aircraft Inventory</h3>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="pax">Passenger</option>
            <option value="cargo">Cargo</option>
            <option value="vip">VIP</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No fleet data available.</p>
          ) : (
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-2">Aircraft</th>
                <th>Count</th>
                <th>Manufacturer</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="border-t border-slate-800">
                  <td colSpan={4} className="py-3 text-slate-400">No fleet data available.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.type} className="border-t border-slate-800">
                    <td className="py-2 font-medium">{item.type}</td>
                    <td>{item.count}</td>
                    <td>{item.manufacturer}</td>
                    <td>{item.role}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-4 text-lg font-semibold">Fleet Distribution by Manufacturer</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byManufacturer} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60}>
                  {byManufacturer.map((_, i) => (
                    <Cell key={i} fill={manufacturerColors[i % manufacturerColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-4 text-lg font-semibold">Top Aircraft Earnings (24h)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={aircraftPerformance}>
                <XAxis dataKey="type" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="last24hEarnings" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-4 text-lg font-semibold">Aircraft Performance Ledger</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-2">Aircraft</th>
                <th>Type</th>
                <th>Lifetime Earnings</th>
                <th>Last 24h Earnings</th>
                <th>Flights (24h)</th>
                <th>Avg Load Factor</th>
              </tr>
            </thead>
            <tbody>
              {aircraftPerformance.map((item) => (
                <tr key={item.aircraft} className="border-t border-slate-800">
                  <td className="py-2 font-medium">{item.aircraft}</td>
                  <td>{item.type}</td>
                  <td className="text-sky-300">{money(item.lifetimeEarnings)}</td>
                  <td className="text-emerald-300">{money(item.last24hEarnings)}</td>
                  <td>{item.flights24h}</td>
                  <td>{item.avgLoadFactor}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
