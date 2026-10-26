"use client";

import { STATUSES } from "./admin-filters";

interface StatusAssigneeBarProps {
  status: string;
  assignedTo?: string | null;
  currentUserEmail: string;
  onUpdate: (fields: { status?: string; assigned_to?: string | null }) => void;
}

export function StatusAssigneeBar({
  status,
  assignedTo,
  currentUserEmail,
  onUpdate,
}: StatusAssigneeBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-y border-slate-100 text-xs">
      <div className="flex items-center space-x-2">
        <span className="text-slate-500 font-medium">Status:</span>
        <select
          value={status}
          onChange={(e) => onUpdate({ status: e.target.value })}
          className="text-xs rounded-lg border border-slate-300 px-2.5 py-1 text-slate-900 bg-white font-medium"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-slate-500 font-medium">Assignee:</span>
        <button
          type="button"
          onClick={() =>
            onUpdate({
              assigned_to: assignedTo ? null : currentUserEmail,
            })
          }
          className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          {assignedTo ? assignedTo : "Assign to me"}
        </button>
      </div>
    </div>
  );
}
