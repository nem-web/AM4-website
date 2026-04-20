import React, { useMemo, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const money = (n) => `$${Math.abs(Number(n)).toLocaleString()}`;
const colors = ["#38bdf8", "#f97316", "#ef4444"];

export default function FinanceView({ finance, transactions }) {
  const [filter, setFilter] = useState("all");

  const expenseData = [
    { name: "Fuel", value: finance.breakdown.fuelExpenses },
    { name: "Route Fees", value: finance.breakdown.routeFees },
    { name: "A/C Orders", value: finance.breakdown.acOrders }
  ];

  const summaryData = [
    { name: "Income", value: finance.income },
    { name: "Expenses", value: finance.expenses }
  ];

  const projectionData = [
    { label: "Per Day", value: finance.netResult },
    { label: "Per Week", value: finance.netResult * 7 }
  ];

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((item) => item.type === filter);
  }, [transactions, filter]);

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-4 text-lg font-semibold">24h Income vs Expenses</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={summaryData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={55}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip formatter={(v) => money(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-4 text-lg font-semibold">Expense Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={expenseData} dataKey="value" nameKey="name" outerRadius={105} innerRadius={60}>
                  {expenseData.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => money(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-4 text-lg font-semibold">Income Projection</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={projectionData}>
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Transaction Feed</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {filteredTransactions.map((txn, index) => (
              <div key={`${txn.time}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <div>
                  <p className="font-medium">{txn.desc}</p>
                  <p className="text-xs text-slate-400">{txn.time}</p>
                </div>
                <p className={`font-semibold ${txn.amount >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {txn.amount >= 0 ? "+" : "-"}{money(txn.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
