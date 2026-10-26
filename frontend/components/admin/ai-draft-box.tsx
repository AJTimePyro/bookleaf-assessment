"use client";

import { Bot, Copy, RefreshCw, Sparkles } from "lucide-react";

interface AiDraftBoxProps {
  draft: string | null;
  generating: boolean;
  onGenerate: () => void;
  onInsertDraft: (draft: string) => void;
}

export function AiDraftBox({
  draft,
  generating,
  onGenerate,
  onInsertDraft,
}: AiDraftBoxProps) {
  return (
    <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs">
          <Bot className="w-4 h-4 text-purple-700" />
          <span>BookLeaf AI Knowledge-Base Response Draft</span>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold rounded-lg flex items-center space-x-1 cursor-pointer disabled:opacity-50"
        >
          {generating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Draft</span>
            </>
          )}
        </button>
      </div>

      {draft ? (
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-purple-200 text-xs text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
            {draft}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onInsertDraft(draft)}
              className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center space-x-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Insert Draft into Reply Box</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-purple-700">
          Click 'Generate Draft' to prepare a response automatically grounded in
          the BookLeaf Knowledge Base, author details, and policy guidelines.
        </p>
      )}
    </div>
  );
}
