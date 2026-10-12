"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BookForm, type BookFormData } from "@/components/BookForm";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000/api/v1";

  const [initial, setInitial] = useState<Partial<BookFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiBase}/books/${id}`, { credentials: "include" })
      .then(r => r.json())
      .then(b => {
        setInitial({
          title: b.title ?? "",
          price: String(b.price ?? ""),
          description: b.description ?? "",
          thumbnail: b.thumbnail ?? "",
          series_id: b.series_id ? String(b.series_id) : "",
          volume_number: b.volume_number ? String(b.volume_number) : "",
          author_ids: (b.authors ?? []).map((a: { id: number }) => a.id).join(","),
          genre_ids: (b.genres ?? []).map((g: { id: number }) => g.id).join(","),
        });
      })
      .catch(() => setError("Failed to load book"));
  }, [id, apiBase]);

  const handleSubmit = async (data: BookFormData) => {
    const token = document.cookie.split(";").find(c => c.trim().startsWith("access_token="))?.split("=")[1];
    const res = await fetch(`${apiBase}/books/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        title: data.title,
        price: data.price,
        description: data.description || null,
        thumbnail: data.thumbnail || null,
        series_id: data.series_id ? Number(data.series_id) : null,
        volume_number: data.volume_number ? Number(data.volume_number) : null,
        author_ids: data.author_ids ? data.author_ids.split(",").map(s => Number(s.trim())).filter(Boolean) : [],
        genre_ids: data.genre_ids ? data.genre_ids.split(",").map(s => Number(s.trim())).filter(Boolean) : [],
      }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail ?? "Failed to update book"); }
    router.push("/dashboard");
  };

  if (error) return <p className="p-10 text-red-600">{error}</p>;
  if (!initial) return <div className="flex items-center justify-center min-h-screen text-ink-muted">Loading…</div>;

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink mb-6 inline-block">← Dashboard</Link>
      <h1 className="text-2xl font-bold text-ink mb-8">Edit book</h1>
      <BookForm initial={initial} onSubmit={handleSubmit} submitLabel="Save changes" />
    </main>
  );
}
