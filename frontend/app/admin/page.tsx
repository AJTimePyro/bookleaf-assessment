"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminMetrics } from "@/components/admin/admin-metrics";
import { AdminQueueList } from "@/components/admin/admin-queue-list";
import { AdminTicketWorkspace } from "@/components/admin/admin-ticket-workspace";
import { usePolling } from "@/hooks/use-polling";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { TicketDetail, TicketSummary } from "@/types";

export default function AdminPortal() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketDetail, setTicketDetail] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // AI Draft
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);

  // Reply & Notes
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await api.tickets.getTickets({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        date_filter: dateFilter || undefined,
        search: searchQuery || undefined,
      });
      setTickets(data);
    } catch (err) {
      console.error("Failed to load queue:", err);
    }
  }, [statusFilter, categoryFilter, priorityFilter, dateFilter, searchQuery]);

  usePolling(fetchTickets, 3500, !!user && user.role === "admin");

  const fetchTicketDetail = useCallback(async () => {
    if (!selectedTicketId) return;
    try {
      const detail = await api.tickets.getTicket(selectedTicketId);
      setTicketDetail(detail);
    } catch (err) {
      console.error("Failed to fetch detail:", err);
    }
  }, [selectedTicketId]);

  usePolling(fetchTicketDetail, 3000, !!selectedTicketId);

  useEffect(() => {
    if (selectedTicketId) {
      setDetailLoading(true);
      fetchTicketDetail().finally(() => setDetailLoading(false));

      setGeneratingDraft(true);
      api.tickets
        .getAiDraft(selectedTicketId)
        .then((res) => {
          setAiDraft(res.draft);
          setReplyText((prev) => (prev ? prev : res.draft));
        })
        .catch((err) => console.error("Auto draft error:", err))
        .finally(() => setGeneratingDraft(false));
    } else {
      setTicketDetail(null);
      setAiDraft(null);
      setReplyText("");
    }
  }, [selectedTicketId, fetchTicketDetail]);

  const handleGenerateDraft = async () => {
    if (!selectedTicketId) return;
    setGeneratingDraft(true);
    try {
      const res = await api.tickets.getAiDraft(selectedTicketId);
      setAiDraft(res.draft);
      if (!replyText) {
        setReplyText(res.draft);
      }
    } catch (err) {
      console.error("Failed to generate AI draft:", err);
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleUpdateTicket = async (fields: {
    category?: string;
    priority?: string;
    status?: string;
    assigned_to?: string | null;
  }) => {
    if (!selectedTicketId) return;
    try {
      const updated = await api.tickets.updateTicket(selectedTicketId, fields);
      setTicketDetail(updated);
      await fetchTickets();
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const updated = await api.tickets.sendMessage(
        selectedTicketId,
        replyText,
      );
      setTicketDetail(updated);
      setReplyText("");
      await fetchTickets();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !noteText.trim()) return;
    setSavingNote(true);
    try {
      const updated = await api.tickets.addNote(selectedTicketId, noteText);
      setTicketDetail(updated);
      setNoteText("");
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSavingNote(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <AdminHeader user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        <AdminMetrics tickets={tickets} />

        <AdminFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          priorityFilter={priorityFilter}
          dateFilter={dateFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onCategoryChange={setCategoryFilter}
          onPriorityChange={setPriorityFilter}
          onDateChange={setDateFilter}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <AdminQueueList
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
          />

          <AdminTicketWorkspace
            selectedTicketId={selectedTicketId}
            ticketDetail={ticketDetail}
            detailLoading={detailLoading}
            user={user}
            aiDraft={aiDraft}
            generatingDraft={generatingDraft}
            replyText={replyText}
            sendingReply={sendingReply}
            noteText={noteText}
            savingNote={savingNote}
            onClose={() => setSelectedTicketId(null)}
            onUpdateTicket={handleUpdateTicket}
            onGenerateDraft={handleGenerateDraft}
            onInsertDraft={(draft) => setReplyText(draft)}
            onReplyTextChange={setReplyText}
            onSendReply={handleSendReply}
            onNoteTextChange={setNoteText}
            onAddNote={handleAddNote}
          />
        </div>
      </main>
    </div>
  );
}
