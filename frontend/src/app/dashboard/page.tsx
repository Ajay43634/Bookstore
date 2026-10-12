"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiLogout, apiMe } from "@/lib/api/auth";
import type { AuthorMe } from "@/lib/api/auth";
import type { BookSummary } from "@/lib/api/books";

export default function DashboardPage() {
  const router = useRouter();
  const [author, setAuthor] = useState<AuthorMe | null>(null);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000/api/v1";

  useEffect(() => {
    const init = async () => {
      const me = await apiMe();
      if (!me) { router.replace("/login"); return; }
      setAuthor(me);
      const res = await fetch(`${apiBase}/books?author_id=${me.id}&page_size=100`, { credentials: "include" });
      if (res.ok) { const data = await res.json(); setBooks(data.data); }
      setLoading(false);
    };
    init();
  }, [router, apiBase]);

  const logout = async () => { await apiLogout(); router.push("/"); };

  const deleteBook = async (id: number) => {
    if (!confirm("Delete this book?")) return;
    const token = document.cookie.split(";").find(c => c.trim().startsWith("access_token="))?.split("=")[1];
    const res = await fetch(`${apiBase}/books/${id}`, {
      method: "DELETE", credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) setBooks(b => b.filter(book => book.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-ink-muted">Loading…</div>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          {author && <p className="text-ink-muted text-sm mt-0.5">Welcome, {author.name}</p>}
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/books/new" className="px-4 py-2 bg-blue text-ink text-sm font-medium rounded-lg hover:bg-blue-deep transition-colors">
            + New book
          </Link>
          <button onClick={logout} className="px-4 py-2 border border-bg-sunken text-ink-muted text-sm rounded-lg hover:bg-bg-sunken transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="py-20 text-center text-ink-faint">
          <p className="text-lg mb-4">You haven't published any books yet.</p>
          <Link href="/dashboard/books/new" className="text-blue-deep hover:underline text-sm">Add your first book →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {books.map(book => (
            <div key={book.id} className="flex gap-4 items-center bg-bg-elevated border border-bg-sunken rounded-lg p-4">
              <div className="w-10 h-14 shrink-0 rounded overflow-hidden bg-bg-sunken">
                {book.thumbnail ? <img src={book.thumbnail} alt="" className="w-full h-full object-cover" /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ink font-medium text-sm line-clamp-1">{book.title}</p>
                <p className="text-ink-muted text-xs mt-0.5">${book.price}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/dashboard/books/${book.id}/edit`} className="px-3 py-1.5 text-xs border border-bg-sunken text-ink-muted rounded hover:bg-bg-sunken transition-colors">Edit</Link>
                <button onClick={() => deleteBook(book.id)} className="px-3 py-1.5 text-xs border border-bg-sunken text-ink-faint rounded hover:bg-bg-sunken transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
