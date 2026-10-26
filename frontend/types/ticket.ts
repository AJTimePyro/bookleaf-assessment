import type { Book } from "./book";
import type { User } from "./user";

export type TicketPriority = "Critical" | "High" | "Medium" | "Low";
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface TicketMessage {
  id: number;
  sender_id: string;
  sender_name: string;
  sender_role: "author" | "admin";
  content: string;
  created_at: string;
}

export interface InternalNote {
  id: number;
  admin_id: string;
  admin_name: string;
  content: string;
  created_at: string;
}

export interface TicketSummary {
  id: number;
  ticket_number: string;
  author_id: string;
  author_name?: string | null;
  book_id?: string | null;
  book_title?: string | null;
  subject: string;
  description: string;
  category: string;
  ai_category?: string | null;
  priority: TicketPriority;
  ai_priority?: TicketPriority | null;
  ai_reason?: string | null;
  status: TicketStatus;
  assigned_to?: string | null;
  attachment_name?: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface TicketDetail extends TicketSummary {
  author?: User | null;
  book?: Book | null;
  messages: TicketMessage[];
  internal_notes: InternalNote[];
}

export interface TicketFilterParams {
  status?: string;
  category?: string;
  priority?: string;
  date_filter?: string;
  search?: string;
}

export interface CreateTicketPayload {
  book_id?: string | null;
  subject: string;
  description: string;
  attachment_name?: string | null;
}

export interface UpdateTicketPayload {
  category?: string;
  priority?: string;
  status?: string;
  assigned_to?: string | null;
}
