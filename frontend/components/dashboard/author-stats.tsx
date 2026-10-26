"use client";

import { Clock, DollarSign, Layers, TrendingUp } from "lucide-react";
import type { Book } from "@/types";

interface AuthorStatsProps {
  books: Book[];
}

export function AuthorStats({ books }: AuthorStatsProps) {
  const totalCopiesSold = books.reduce(
    (sum, b) => sum + (b.total_copies_sold || 0),
    0,
  );
  const totalRoyaltiesEarned = books.reduce(
    (sum, b) => sum + (b.total_royalty_earned || 0),
    0,
  );
  const totalRoyaltiesPending = books.reduce(
    (sum, b) => sum + (b.royalty_pending || 0),
    0,
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            My Books
          </span>
          <Layers className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900">{books.length}</div>
        <p className="text-xs text-slate-500 mt-1">Titles in your catalog</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Copies Sold
          </span>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {totalCopiesSold.toLocaleString()}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Across all retail channels
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Royalties Earned
          </span>
          <DollarSign className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold text-emerald-700">
          ₹{totalRoyaltiesEarned.toLocaleString("en-IN")}
        </div>
        <p className="text-xs text-slate-500 mt-1">Net profit 80% split</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Pending Royalties
          </span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900">
          ₹{totalRoyaltiesPending.toLocaleString("en-IN")}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {totalRoyaltiesPending < 1000 && totalRoyaltiesPending > 0
            ? "Threshold: ₹1,000 (Rolls over to next Q)"
            : "Eligible for next quarterly payout"}
        </p>
      </div>
    </div>
  );
}
