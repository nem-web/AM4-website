import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import MetricCard from "./MetricCard";

const money = (n) => `$${Number(n).toLocaleString()}`;

export default function OverviewView({ company, finance, incomeTrend24h }) {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Current Balance" value={money(finance.balance)} tone="accent" />
        <MetricCard label="24h Income" value={money(finance.income)} tone="positive" />
        <MetricCard label="24h Expenses" value={money(finance.expenses)} tone="negative" />
        <MetricCard label="24h Net Profit" value={money(finance.netResult)} tone="positive" />
        <MetricCard label="Total Fleet" value={company.fleetCount} />
        <MetricCard label="Total Routes" value={company.routesCount} />
      </div>

      <div className="card p-4">
        <h3 className="mb-4 text-lg font-semibold">Income Trend (24h)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={incomeTrend24h}>
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => money(v)} />
              <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
