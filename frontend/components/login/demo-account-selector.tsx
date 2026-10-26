"use client";

import { ArrowRight, Shield, Sparkles, User as UserIcon } from "lucide-react";

interface DemoAccount {
  name: string;
  email: string;
  role: "Author" | "Admin";
  highlight: string;
  badgeColor: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    role: "Author",
    highlight: "2 published books • ₹11.9k earned • Active ISBN ticket",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    name: "Rohit Kapoor",
    email: "rohit.kapoor@email.com",
    role: "Author",
    highlight: "Bestseller (1,200+ sold) • Active print defect ticket",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    name: "Diya Chatterjee",
    email: "diya.chatterjee@email.com",
    role: "Author",
    highlight: "Edge Case: ₹850 pending (under ₹1,000 threshold policy)",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    name: "Operations Admin",
    email: "admin@bookleaf.com",
    role: "Admin",
    highlight: "Full operations queue • AI draft editor • Staff notes & triage",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

interface DemoAccountSelectorProps {
  onSelect: (email: string) => void;
  activeDemo: string | null;
  disabled: boolean;
}

export function DemoAccountSelector({
  onSelect,
  activeDemo,
  disabled,
}: DemoAccountSelectorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          1-Click Evaluator Accounts (Instant Test)
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            type="button"
            key={acc.email}
            onClick={() => onSelect(acc.email)}
            disabled={disabled || activeDemo !== null}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-left group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {acc.role === "Admin" ? (
                  <Shield className="w-5 h-5" />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-900">
                    {acc.name}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${acc.badgeColor}`}
                  >
                    {acc.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{acc.highlight}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
