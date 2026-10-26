"use client";

import { ChevronRight } from "lucide-react";
import type { Book } from "@/types";

interface BookCardProps {
  book: Book;
  onRaiseTicket: (bookId: string) => void;
}

export function BookCard({ book, onRaiseTicket }: BookCardProps) {
  const isProduction = book.status.toLowerCase().includes("production");

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">{book.title}</h3>
            <span className="text-xs text-slate-500 font-mono">
              ISBN: {book.isbn} • {book.genre}
            </span>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${
              isProduction
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {book.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 my-3 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              MRP
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {book.mrp ? `₹${book.mrp}` : "N/A (Pending)"}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Copies Sold
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {book.total_copies_sold}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Royalty Earned
            </span>
            <span className="text-sm font-semibold text-emerald-700">
              ₹{book.total_royalty_earned.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400">Royalty Paid:</span>
            <span className="font-medium text-slate-800">
              ₹{book.royalty_paid.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Royalty Pending:</span>
            <span className="font-semibold text-slate-900">
              ₹{book.royalty_pending.toLocaleString("en-IN")}
            </span>
          </div>
          {book.last_royalty_payout_date && (
            <div className="flex justify-between">
              <span className="text-slate-400">Last Payout Date:</span>
              <span className="font-medium text-slate-800">
                {book.last_royalty_payout_date}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Print Partner:</span>
            <span className="font-medium text-slate-800">
              {book.print_partner || "In Production (Pending)"}
            </span>
          </div>
        </div>

        {book.available_on && book.available_on.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 block mb-1">
              Available On:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {book.available_on.map((p) => (
                <span
                  key={p}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={() => onRaiseTicket(book.book_id)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
        >
          <span>Raise ticket for this book</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
