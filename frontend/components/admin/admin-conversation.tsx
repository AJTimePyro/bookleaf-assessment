"use client";

import { RefreshCw, Send } from "lucide-react";
import type React from "react";
import type { TicketMessage } from "@/types";

interface AdminConversationProps {
  messages: TicketMessage[];
  replyText: string;
  sendingReply: boolean;
  onReplyTextChange: (text: string) => void;
  onSendReply: (e: React.FormEvent) => void;
}

export function AdminConversation({
  messages,
  replyText,
  sendingReply,
  onReplyTextChange,
  onSendReply,
}: AdminConversationProps) {
  return (
    <div className="space-y-4">
      <div className="max-h-60 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
        {messages.map((m) => {
          const isAdmin = m.sender_role === "admin";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] text-slate-400 mb-0.5">
                {m.sender_name} ({m.sender_role}) •{" "}
                {new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs whitespace-pre-wrap leading-relaxed ${
                  isAdmin
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={onSendReply} className="space-y-2">
        <textarea
          rows={4}
          value={replyText}
          onChange={(e) => onReplyTextChange(e.target.value)}
          placeholder="Edit or write response to the author..."
          className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-400">
            Sending response will transition ticket to 'In Progress'
          </span>
          <button
            type="submit"
            disabled={sendingReply || !replyText.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {sendingReply ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Send Response to Author</span>
          </button>
        </div>
      </form>
    </div>
  );
}
