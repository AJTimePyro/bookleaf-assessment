"use client";

import type { TicketSummary } from "@/types";

interface AdminMetricsProps {
  tickets: TicketSummary[];
}

export function AdminMetrics({ tickets }: AdminMetricsProps) {
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const urgentCount = tickets.filter(
    (t) => t.priority === "Critical" || t.priority === "High",
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "Resolved" || t.status === "Closed",
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Total Queue
        </span>
        <div className="text-2xl font-bold text-slate-900 mt-1">
          {totalCount}
        </div>
        <span className="text-[11px] text-slate-500">Across all authors</span>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
          Open Queries
        </span>
        <div className="text-2xl font-bold text-blue-700 mt-1">{openCount}</div>
        <span className="text-[11px] text-slate-500">
          Awaiting initial action
        </span>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">
          Urgent & Critical
        </span>
        <div className="text-2xl font-bold text-red-700 mt-1">
          {urgentCount}
        </div>
        <span className="text-[11px] text-slate-500">
          Critical / High priority
        </span>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
          Resolved / Closed
        </span>
        <div className="text-2xl font-bold text-emerald-700 mt-1">
          {resolvedCount}
        </div>
        <span className="text-[11px] text-slate-500">Satisfied inquiries</span>
      </div>
    </div>
  );
}
