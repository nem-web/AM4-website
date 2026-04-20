import React, { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const manufacturerColors = ["#0ea5e9", "#22c55e", "#a855f7", "#f59e0b", "#ef4444"];

export default function FleetView({ fleet }) {
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
              {filtered.map((item) => (
                <tr key={item.type} className="border-t border-slate-800">
                  <td className="py-2 font-medium">{item.type}</td>
                  <td>{item.count}</td>
                  <td>{item.manufacturer}</td>
                  <td>{item.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
    </section>
  );
}
