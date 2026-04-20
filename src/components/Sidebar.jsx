import React from "react";
import { BarChart3, CircleDollarSign, Plane, Route } from "lucide-react";

const navItems = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "finances", label: "Finances", icon: CircleDollarSign },
  { key: "fleet", label: "Fleet", icon: Plane },
  { key: "routes", label: "Routes", icon: Route }
];

export default function Sidebar({ activeView, onChange }) {
  return (
    <aside className="card h-fit w-full lg:sticky lg:top-4 lg:w-64">
      <div className="border-b border-slate-800 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-400">Operations</p>
        <h2 className="mt-2 text-xl font-bold">Airways Snake3265</h2>
      </div>
      <nav className="space-y-2 p-4">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
              activeView === key
                ? "bg-sky-500/20 text-sky-300"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
