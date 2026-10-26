"use client";

import { Lock } from "lucide-react";
import type React from "react";
import type { InternalNote } from "@/types";

interface InternalNotesProps {
  notes: InternalNote[];
  noteText: string;
  savingNote: boolean;
  onNoteTextChange: (text: string) => void;
  onAddNote: (e: React.SubmitEvent) => void;
}

export function InternalNotes({
  notes,
  noteText,
  savingNote,
  onNoteTextChange,
  onAddNote,
}: InternalNotesProps) {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
        <Lock className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Internal notes are visible ONLY to BookLeaf team members and are never
          shown to the author.
        </span>
      </div>

      <div className="max-h-56 overflow-y-auto space-y-2">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            No internal notes recorded for this ticket yet.
          </p>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1"
            >
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="font-semibold text-slate-700">
                  {n.admin_name} ({n.admin_id})
                </span>
                <span>{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <p className="text-slate-800 whitespace-pre-wrap">{n.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={onAddNote} className="space-y-2">
        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => onNoteTextChange(e.target.value)}
          placeholder="Add private staff note (e.g. escalated to warehouse, vendor case ID, finance sync)..."
          className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingNote || !noteText.trim()}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Add Internal Note</span>
          </button>
        </div>
      </form>
    </div>
  );
}
