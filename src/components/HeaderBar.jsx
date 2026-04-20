import React from "react";

const currency = (n) => `$${Number(n).toLocaleString()}`;

export default function HeaderBar({ company, balance }) {
  return (
    <header className="card mb-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Company Profile</p>
        <h1 className="text-2xl font-bold text-white">{company.name}</h1>
        <p className="text-sm text-slate-400">User ID: {company.id} • Subsidiary: {company.subsidiary}</p>
      </div>
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-right">
        <p className="text-xs text-emerald-300">Current Balance</p>
        <p className="text-2xl font-bold text-emerald-200">{currency(balance)}</p>
      </div>
    </header>
  );
}
