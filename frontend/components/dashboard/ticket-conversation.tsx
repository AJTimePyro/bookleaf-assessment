"use client";

import { MessageSquare, RefreshCw, Send, X } from "lucide-react";
import type React from "react";
import type { TicketDetail } from "@/types";

interface TicketConversationProps {
  selectedTicketId: number | null;
  ticketDetail: TicketDetail | null;
  loading: boolean;
  replyContent: string;
  sendingReply: boolean;
  onReplyChange: (text: string) => void;
  onSendReply: (e: React.FormEvent) => void;
  onClose: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "In Progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Closed":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export function TicketConversation({
  selectedTicketId,
  ticketDetail,
  loading,
  replyContent,
  sendingReply,
  onReplyChange,
  onSendReply,
  onClose,
}: TicketConversationProps) {
  if (!selectedTicketId || !ticketDetail) {
    return (
      <div className="lg:col-span-7">
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center h-[500px]">
          <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
          <h4 className="text-sm font-semibold text-slate-800">
            Select a ticket to view the conversation
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Select any support query from the list to view updates from our team
            or reply.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-7">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[700px]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {ticketDetail.ticket_number}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${getStatusBadge(
                    ticketDetail.status,
                  )}`}
                >
                  {ticketDetail.status}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {ticketDetail.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {ticketDetail.subject}
              </h3>
              <p className="text-xs text-slate-500">
                About: {ticketDetail.book?.title || "General / Account Inquiry"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
            </div>
          ) : (
            ticketDetail.messages.map((msg) => {
              const isAuthor = msg.sender_role === "author";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isAuthor ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700">
                      {isAuthor ? "You" : "BookLeaf Operations"}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                      isAuthor
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Form */}
        <form
          onSubmit={onSendReply}
          className="p-3 border-t border-slate-200 bg-white rounded-b-xl flex items-center space-x-2"
        >
          <textarea
            rows={2}
            value={replyContent}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder="Type your response to the support team..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 resize-none text-slate-900"
          />
          <button
            type="submit"
            disabled={sendingReply || !replyContent.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {sendingReply ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
