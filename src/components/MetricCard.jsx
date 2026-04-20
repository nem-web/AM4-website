import React from "react";

export default function MetricCard({ label, value, tone = "default" }) {
  const toneStyles = {
    default: "text-slate-200",
    positive: "text-emerald-300",
    negative: "text-rose-300",
    accent: "text-sky-300"
  };

  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneStyles[tone]}`}>{value}</p>
    </div>
  );
}
