"use client";

import { getPriorityBadge, getStatusBadge } from "@/lib/badges";
import type { TicketSummary } from "@/types";

interface AdminQueueListProps {
  tickets: TicketSummary[];
  selectedTicketId: number | null;
  onSelectTicket: (id: number) => void;
}

export function AdminQueueList({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: AdminQueueListProps) {
  return (
    <div className="lg:col-span-5 space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider px-1">
        <span>Queue ({tickets.length} tickets)</span>
        <span className="text-[11px] text-slate-400 font-normal">
          Prioritizing critical & oldest queries
        </span>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            No tickets match active filters.
          </p>
        </div>
      ) : (
        tickets.map((t) => {
          const isSelected = selectedTicketId === t.id;
          const isUrgent = t.priority === "Critical" || t.priority === "High";

          return (
            <button
              type="button"
              key={t.id}
              onClick={() => onSelectTicket(t.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer bg-white relative block ${
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-50 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              } ${isUrgent && t.status === "Open" ? "border-l-4 border-l-red-500" : ""}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {t.ticket_number}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityBadge(
                      t.priority,
                    )}`}
                  >
                    {t.priority}
                  </span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${getStatusBadge(
                    t.status,
                  )}`}
                >
                  {t.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                {t.subject}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                {t.description}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">
                  {t.author_name} ({t.author_id})
                </span>
                <span className="text-slate-400">{t.category}</span>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
