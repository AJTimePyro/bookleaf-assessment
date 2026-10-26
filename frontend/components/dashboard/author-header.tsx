"use client";

import { BookOpen, LogOut, PlusCircle } from "lucide-react";
import type { User } from "@/types";

interface AuthorHeaderProps {
  user: User;
  onOpenNewTicket: () => void;
  onLogout: () => void;
}

export function AuthorHeader({
  user,
  onOpenNewTicket,
  onLogout,
}: AuthorHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              BookLeaf Publishing
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              Author Hub • {user.name} ({user.author_id})
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={onOpenNewTicket}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise Support Query</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
