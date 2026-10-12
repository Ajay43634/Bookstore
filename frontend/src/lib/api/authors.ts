const BASE = process.env.INTERNAL_API_BASE ?? "http://localhost:4000/api/v1";

export interface AuthorSummary {
  id: number;
  name: string;
  bio: string | null;
  profile_picture: string | null;
  nationality: string | null;
}

export interface AuthorDetail extends AuthorSummary {
  email: string;
  date_of_birth: string | null;
  books: { id: number; title: string; thumbnail: string | null; price: string }[];
}

export interface PaginatedAuthors {
  data: AuthorSummary[];
  page: number;
  page_size: number;
  total: number;
}

export async function fetchAuthors(page = 1, pageSize = 100): Promise<PaginatedAuthors> {
  const res = await fetch(`${BASE}/authors?page=${page}&page_size=${pageSize}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch authors");
  return res.json();
}

export async function fetchAuthor(id: number): Promise<AuthorDetail> {
  const res = await fetch(`${BASE}/authors/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Author not found");
  return res.json();
}
