const BASE = process.env.INTERNAL_API_BASE ?? "http://localhost:4000/api/v1";

export interface AuthorRef  { id: number; name: string }
export interface GenreRef   { id: number; name: string }
export interface SeriesRef  { id: number; name: string; volume_number: number | null }

export interface BookSummary {
  id: number;
  title: string;
  description: string | null;
  publish_date: string | null;
  price: string;
  thumbnail: string | null;
  authors: AuthorRef[];
  genres: GenreRef[];
}

export interface BookDetail extends BookSummary {
  series: SeriesRef | null;
  volume_number: number | null;
}

export interface PaginatedBooks {
  data: BookSummary[];
  page: number;
  page_size: number;
  total: number;
}

export interface BookFilters {
  q?: string;
  author_id?: string;
  genre?: string;
  published_after?: string;
  published_before?: string;
  series_id?: string;
  page?: string;
  page_size?: string;
}

export async function fetchBooks(filters: BookFilters = {}): Promise<PaginatedBooks> {
  const url = new URL(`${BASE}/books`);
  Object.entries(filters).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

export async function fetchBook(id: number): Promise<BookDetail> {
  const res = await fetch(`${BASE}/books/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Book not found");
  return res.json();
}
