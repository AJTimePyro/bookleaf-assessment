"use client";

import { Paperclip, PlusCircle, RefreshCw, X } from "lucide-react";
import type React from "react";
import type { Book } from "@/types";

interface NewTicketModalProps {
  isOpen: boolean;
  books: Book[];
  selectedBookId: string;
  subject: string;
  description: string;
  attachment: string | null;
  submitting: boolean;
  error: string | null;
  onBookChange: (bookId: string) => void;
  onSubjectChange: (subj: string) => void;
  onDescriptionChange: (desc: string) => void;
  onAttachmentChange: (name: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function NewTicketModal({
  isOpen,
  books,
  selectedBookId,
  subject,
  description,
  attachment,
  submitting,
  error,
  onBookChange,
  onSubjectChange,
  onDescriptionChange,
  onAttachmentChange,
  onSubmit,
  onClose,
}: NewTicketModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Raise a Support Query
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="ticket-book"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Which book is this query about?
            </label>
            <select
              id="ticket-book"
              value={selectedBookId}
              onChange={(e) => onBookChange(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
            >
              <option value="">General / Account Level</option>
              {books.map((b) => (
                <option key={b.book_id} value={b.book_id}>
                  {b.title} ({b.book_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ticket-subject"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Subject Line *
            </label>
            <input
              id="ticket-subject"
              type="text"
              required
              value={subject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="e.g. Question about quarterly royalty payout"
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>

          <div>
            <label
              htmlFor="ticket-description"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Detailed Description *
            </label>
            <textarea
              id="ticket-description"
              rows={4}
              required
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Please describe your query with any specific dates, amounts, or details..."
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>

          <div>
            <label
              htmlFor="ticket-attachment"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Attachment (Optional - UI proof of concept)
            </label>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="ticket-attachment"
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:border-indigo-400 hover:bg-slate-50 cursor-pointer"
              >
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span>
                  {attachment ? attachment : "Select sample image or document"}
                </span>
                <input
                  id="ticket-attachment"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onAttachmentChange(e.target.files[0].name);
                    }
                  }}
                />
              </label>
              {attachment && (
                <button
                  type="button"
                  onClick={() => onAttachmentChange(null)}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Classifying with AI...</span>
                </>
              ) : (
                <span>Submit Query</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
