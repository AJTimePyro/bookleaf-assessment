import type {
  Book,
  CreateTicketPayload,
  DemoUser,
  TicketDetail,
  TicketFilterParams,
  TicketSummary,
  UpdateTicketPayload,
  User,
} from "@/types";

export type {
  Book,
  CreateTicketPayload,
  DemoUser,
  InternalNote,
  TicketDetail,
  TicketFilterParams,
  TicketMessage,
  TicketPriority,
  TicketStatus,
  TicketSummary,
  UpdateTicketPayload,
  User,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("bookleaf_token")
      : null;
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API request failed with status ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.detail) {
        errorMsg =
          typeof errData.detail === "string"
            ? errData.detail
            : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; token_type: string; user: User }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      ),
    getMe: () => request<User>("/auth/me"),
    getDemoUsers: () => request<DemoUser[]>("/auth/demo-users"),
  },
  books: {
    getBooks: (authorId?: string) => {
      const url = authorId
        ? `/books?author_id=${encodeURIComponent(authorId)}`
        : "/books";
      return request<Book[]>(url);
    },
    getBook: (bookId: string) => request<Book>(`/books/${bookId}`),
  },
  tickets: {
    getTickets: (filters?: TicketFilterParams) => {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.date_filter)
        params.append("date_filter", filters.date_filter);
      if (filters?.search) params.append("search", filters.search);

      const qs = params.toString() ? `?${params.toString()}` : "";
      return request<TicketSummary[]>(`/tickets${qs}`);
    },
    getTicket: (id: number) => request<TicketDetail>(`/tickets/${id}`),
    createTicket: (data: CreateTicketPayload) =>
      request<TicketDetail>("/tickets", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateTicket: (id: number, data: UpdateTicketPayload) =>
      request<TicketDetail>(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    sendMessage: (id: number, content: string, status?: string) =>
      request<TicketDetail>(`/tickets/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content, status }),
      }),
    addNote: (id: number, content: string) =>
      request<TicketDetail>(`/tickets/${id}/notes`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    getAiDraft: (id: number) =>
      request<{ draft: string }>(`/tickets/${id}/ai-draft`, {
        method: "POST",
      }),
  },
};
