"use client";

import { Search } from "lucide-react";

export const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

export const PRIORITIES = ["Critical", "High", "Medium", "Low"];
export const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

interface AdminFiltersProps {
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  priorityFilter: string;
  dateFilter: string;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onPriorityChange: (val: string) => void;
  onDateChange: (val: string) => void;
}

export function AdminFilters({
  searchQuery,
  statusFilter,
  categoryFilter,
  priorityFilter,
  dateFilter,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onPriorityChange,
  onDateChange,
}: AdminFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search author, book, subject..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 text-slate-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              Status: {s}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              Priority: {p}
            </option>
          ))}
        </select>

        <select
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        >
          <option value="">All Dates</option>
          <option value="today">Created Today</option>
          <option value="7days">Past 7 Days</option>
          <option value="30days">Past 30 Days</option>
        </select>
      </div>
    </div>
  );
}
