"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookForm, type BookFormData } from "@/components/BookForm";

export default function NewBookPage() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000/api/v1";

  const handleSubmit = async (data: BookFormData) => {
    const token = document.cookie.split(";").find(c => c.trim().startsWith("access_token="))?.split("=")[1];
    const res = await fetch(`${apiBase}/books`, {
      method: "POST", credentials: "include",
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
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail ?? "Failed to create book"); }
    router.push("/dashboard");
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink mb-6 inline-block">← Dashboard</Link>
      <h1 className="text-2xl font-bold text-ink mb-8">New book</h1>
      <BookForm onSubmit={handleSubmit} submitLabel="Publish book" />
    </main>
  );
}
