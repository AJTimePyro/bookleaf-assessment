"use client";

import { Sparkles } from "lucide-react";
import { CATEGORIES, PRIORITIES } from "./admin-filters";

interface AdminTriageControlsProps {
  category: string;
  aiCategory?: string | null;
  priority: string;
  aiPriority?: string | null;
  aiReason?: string | null;
  onUpdate: (fields: { category?: string; priority?: string }) => void;
}

export function AdminTriageControls({
  category,
  aiCategory,
  priority,
  aiPriority,
  aiReason,
  onUpdate,
}: AdminTriageControlsProps) {
  return (
    <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>AI Triage & Classification</span>
        </div>
        <span className="text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
          Admin Override Enabled
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label
            htmlFor="override-category"
            className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1"
          >
            Category {aiCategory && `(AI: ${aiCategory})`}
          </label>
          <select
            id="override-category"
            value={category}
            onChange={(e) => onUpdate({ category: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:ring-1 focus:ring-indigo-600"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="override-priority"
            className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1"
          >
            Priority {aiPriority && `(AI: ${aiPriority})`}
          </label>
          <select
            id="override-priority"
            value={priority}
            onChange={(e) => onUpdate({ priority: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 focus:ring-1 focus:ring-indigo-600 font-semibold"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {aiReason && (
        <p className="text-[11px] text-indigo-800/80 bg-white/70 p-2 rounded-lg border border-indigo-100">
          <span className="font-semibold">AI Triage Note:</span> {aiReason}
        </p>
      )}
    </div>
  );
}
