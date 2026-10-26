"use client";

import { User } from "lucide-react";
import type { Book, User as UserType } from "@/types";

interface AuthorContextCardProps {
  author?: UserType | null;
  book?: Book | null;
}

export function AuthorContextCard({ author, book }: AuthorContextCardProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
      <div className="flex items-center justify-between text-slate-700 font-semibold border-b border-slate-200 pb-1.5">
        <span className="flex items-center space-x-1.5">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>
            Author: {author?.name} ({author?.email})
          </span>
        </span>
        <span className="text-[11px] text-slate-500">
          City: {author?.city || "N/A"}
        </span>
      </div>

      {book ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
          <div>
            <span className="text-slate-400 block">Book Title</span>
            <span className="font-bold text-slate-900">{book.title}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Status</span>
            <span className="font-semibold text-slate-800">{book.status}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Sold / MRP</span>
            <span className="font-semibold text-slate-800">
              {book.total_copies_sold} sold • ₹{book.mrp || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Pending Royalty</span>
            <span className="font-bold text-emerald-700">
              ₹{book.royalty_pending?.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500">
          Query is general account level (no linked book).
        </p>
      )}
    </div>
  );
}
