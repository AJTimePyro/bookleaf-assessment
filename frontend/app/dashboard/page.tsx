"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { AuthorHeader } from "@/components/dashboard/author-header";
import { AuthorStats } from "@/components/dashboard/author-stats";
import { BookCard } from "@/components/dashboard/book-card";
import { NewTicketModal } from "@/components/dashboard/new-ticket-modal";
import { TicketConversation } from "@/components/dashboard/ticket-conversation";
import { TicketList } from "@/components/dashboard/ticket-list";
import { usePolling } from "@/hooks/use-polling";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Book, TicketDetail, TicketSummary } from "@/types";

export default function AuthorDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"books" | "tickets">("books");
  const [books, setBooks] = useState<Book[]>([]);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketDetail, setTicketDetail] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // New Ticket Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newBookId, setNewBookId] = useState<string>("");
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAttachment, setNewAttachment] = useState<string | null>(null);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Reply State
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === "admin") {
        router.push("/admin");
      }
    }
  }, [user, loading, router]);

  const fetchBooks = useCallback(async () => {
    try {
      const data = await api.books.getBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books:", err);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await api.tickets.getTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === "author") {
      fetchBooks();
      fetchTickets();
    }
  }, [user, fetchBooks, fetchTickets]);

  usePolling(fetchTickets, 3500, !!user && user.role === "author");

  const fetchTicketDetail = useCallback(async () => {
    if (!selectedTicketId) return;
    try {
      const detail = await api.tickets.getTicket(selectedTicketId);
      setTicketDetail(detail);
    } catch (err) {
      console.error("Failed to load ticket detail:", err);
    }
  }, [selectedTicketId]);

  usePolling(fetchTicketDetail, 3000, !!selectedTicketId);

  useEffect(() => {
    if (selectedTicketId) {
      setDetailLoading(true);
      fetchTicketDetail().finally(() => setDetailLoading(false));
    } else {
      setTicketDetail(null);
    }
  }, [selectedTicketId, fetchTicketDetail]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmittingTicket(true);
    try {
      const created = await api.tickets.createTicket({
        book_id: newBookId || null,
        subject: newSubject,
        description: newDescription,
        attachment_name: newAttachment,
      });

      setShowNewModal(false);
      setNewBookId("");
      setNewSubject("");
      setNewDescription("");
      setNewAttachment(null);
      await fetchTickets();
      setSelectedTicketId(created.id);
      setActiveTab("tickets");
    } catch (err: unknown) {
      setModalError(
        err instanceof Error ? err.message : "Failed to submit ticket",
      );
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyContent.trim()) return;
    setSendingReply(true);
    try {
      const updated = await api.tickets.sendMessage(
        selectedTicketId,
        replyContent,
      );
      setTicketDetail(updated);
      setReplyContent("");
      await fetchTickets();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleOpenTicketForBook = (bookId: string) => {
    setNewBookId(bookId);
    setShowNewModal(true);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-2 text-indigo-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading your portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthorHeader
        user={user}
        onOpenNewTicket={() => setShowNewModal(true)}
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <AuthorStats books={books} />

        <div className="flex items-center space-x-1 border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("books")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "books"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            My Books ({books.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === "tickets"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>My Tickets</span>
            {tickets.length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {tickets.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "books" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((book) => (
                <BookCard
                  key={book.book_id}
                  book={book}
                  onRaiseTicket={handleOpenTicketForBook}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <TicketList
              tickets={tickets}
              selectedTicketId={selectedTicketId}
              onSelectTicket={setSelectedTicketId}
              onOpenNewModal={() => setShowNewModal(true)}
            />

            <TicketConversation
              selectedTicketId={selectedTicketId}
              ticketDetail={ticketDetail}
              loading={detailLoading}
              replyContent={replyContent}
              sendingReply={sendingReply}
              onReplyChange={setReplyContent}
              onSendReply={handleSendReply}
              onClose={() => setSelectedTicketId(null)}
            />
          </div>
        )}
      </main>

      <NewTicketModal
        isOpen={showNewModal}
        books={books}
        selectedBookId={newBookId}
        subject={newSubject}
        description={newDescription}
        attachment={newAttachment}
        submitting={submittingTicket}
        error={modalError}
        onBookChange={setNewBookId}
        onSubjectChange={setNewSubject}
        onDescriptionChange={setNewDescription}
        onAttachmentChange={setNewAttachment}
        onSubmit={handleCreateTicket}
        onClose={() => setShowNewModal(false)}
      />
    </div>
  );
}
