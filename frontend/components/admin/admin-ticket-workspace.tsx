"use client";

import { Lock, MessageSquare, RefreshCw, Shield, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { AdminConversation } from "@/components/admin/admin-conversation";
import { AdminTriageControls } from "@/components/admin/admin-triage-controls";
import { AiDraftBox } from "@/components/admin/ai-draft-box";
import { AuthorContextCard } from "@/components/admin/author-context-card";
import { InternalNotes } from "@/components/admin/internal-notes";
import { StatusAssigneeBar } from "@/components/admin/status-assignee-bar";
import { getStatusBadge } from "@/lib/badges";
import type { TicketDetail, User } from "@/types";

interface AdminTicketWorkspaceProps {
  selectedTicketId: number | null;
  ticketDetail: TicketDetail | null;
  detailLoading: boolean;
  user: User;
  aiDraft: string | null;
  generatingDraft: boolean;
  replyText: string;
  sendingReply: boolean;
  noteText: string;
  savingNote: boolean;
  onClose: () => void;
  onUpdateTicket: (fields: {
    category?: string;
    priority?: string;
    status?: string;
    assigned_to?: string | null;
  }) => void;
  onGenerateDraft: () => void;
  onInsertDraft: (draft: string) => void;
  onReplyTextChange: (text: string) => void;
  onSendReply: (e: React.SubmitEvent) => void;
  onNoteTextChange: (text: string) => void;
  onAddNote: (e: React.SubmitEvent) => void;
}

export function AdminTicketWorkspace({
  selectedTicketId,
  ticketDetail,
  detailLoading,
  user,
  aiDraft,
  generatingDraft,
  replyText,
  sendingReply,
  noteText,
  savingNote,
  onClose,
  onUpdateTicket,
  onGenerateDraft,
  onInsertDraft,
  onReplyTextChange,
  onSendReply,
  onNoteTextChange,
  onAddNote,
}: AdminTicketWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"conversation" | "notes">(
    "conversation",
  );

  if (!selectedTicketId || !ticketDetail) {
    return (
      <div className="lg:col-span-7">
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center h-[500px]">
          <Shield className="w-12 h-12 text-slate-300 mb-3" />
          <h4 className="text-sm font-semibold text-slate-800">
            Select a ticket from the queue
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Click any ticket to inspect AI classification, generate Knowledge
            Base draft responses, manage status, or add internal notes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-7">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-4 p-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono font-bold text-indigo-600">
                {ticketDetail.ticket_number}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full border ${getStatusBadge(
                  ticketDetail.status,
                )}`}
              >
                {ticketDetail.status}
              </span>
              {detailLoading && (
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {ticketDetail.subject}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AdminTriageControls
          category={ticketDetail.category}
          aiCategory={ticketDetail.ai_category}
          priority={ticketDetail.priority}
          aiPriority={ticketDetail.ai_priority}
          aiReason={ticketDetail.ai_reason}
          onUpdate={onUpdateTicket}
        />

        <AuthorContextCard
          author={ticketDetail.author}
          book={ticketDetail.book}
        />

        <StatusAssigneeBar
          status={ticketDetail.status}
          assignedTo={ticketDetail.assigned_to}
          currentUserEmail={user.email}
          onUpdate={onUpdateTicket}
        />

        <AiDraftBox
          draft={aiDraft}
          generating={generatingDraft}
          onGenerate={onGenerateDraft}
          onInsertDraft={onInsertDraft}
        />

        {/* Tab switch */}
        <div className="flex items-center space-x-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("conversation")}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "conversation"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Author Conversation ({ticketDetail.messages.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "notes"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>
              Internal Staff Notes ({ticketDetail.internal_notes.length})
            </span>
          </button>
        </div>

        {activeTab === "conversation" && (
          <AdminConversation
            messages={ticketDetail.messages}
            replyText={replyText}
            sendingReply={sendingReply}
            onReplyTextChange={onReplyTextChange}
            onSendReply={onSendReply}
          />
        )}

        {activeTab === "notes" && (
          <InternalNotes
            notes={ticketDetail.internal_notes}
            noteText={noteText}
            savingNote={savingNote}
            onNoteTextChange={onNoteTextChange}
            onAddNote={onAddNote}
          />
        )}
      </div>
    </div>
  );
}
