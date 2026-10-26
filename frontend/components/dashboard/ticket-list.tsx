"use client";

import { HelpCircle, MessageSquare, PlusCircle } from "lucide-react";
import { getStatusBadge } from "@/lib/badges";
import type { TicketSummary } from "@/types";

interface TicketListProps {
  tickets: TicketSummary[];
  selectedTicketId: number | null;
  onSelectTicket: (id: number) => void;
  onOpenNewModal: () => void;
}

export function TicketList({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onOpenNewModal,
}: TicketListProps) {
  return (
    <div className="lg:col-span-5 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Support Tickets ({tickets.length})
        </span>
        <span className="text-[11px] text-slate-400 flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Near-realtime sync</span>
        </span>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-800">
            No tickets submitted yet
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Have questions about royalties, printing, or ISBN? Raise a ticket
            and our team will assist you.
          </p>
          <button
            type="button"
            onClick={onOpenNewModal}
            className="mt-4 inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Raise Query</span>
          </button>
        </div>
      ) : (
        tickets.map((t) => {
          const isSelected = selectedTicketId === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => onSelectTicket(t.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer bg-white block ${
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {t.ticket_number}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${getStatusBadge(
                    t.status,
                  )}`}
                >
                  {t.status}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                {t.subject}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                {t.description}
              </p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>{t.book_title || "General / Account Level"}</span>
                <span className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{t.message_count} messages</span>
                </span>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
