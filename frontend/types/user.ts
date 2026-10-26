export interface User {
  id: number;
  author_id?: string | null;
  email: string;
  name: string;
  role: "author" | "admin";
  phone?: string | null;
  city?: string | null;
  joined_date?: string | null;
}

export interface DemoUser {
  name: string;
  email: string;
  role: "author" | "admin";
  description: string;
}
