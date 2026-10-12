"use client";

import { useState } from "react";

export interface BookFormData {
  title: string; price: string; description: string; thumbnail: string;
  series_id: string; volume_number: string; author_ids: string; genre_ids: string;
}

interface Props {
  initial?: Partial<BookFormData>;
  onSubmit: (data: BookFormData) => Promise<void>;
  submitLabel: string;
}

const INITIAL: BookFormData = { title: "", price: "", description: "", thumbnail: "", series_id: "", volume_number: "", author_ids: "", genre_ids: "" };

export function BookForm({ initial = {}, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<BookFormData>({ ...INITIAL, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof BookFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try { await onSubmit(form); } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save book");
    } finally { setLoading(false); }
  };

  const field = "w-full px-3 py-2 rounded border border-bg-sunken bg-bg-elevated text-ink text-sm focus:outline-none focus:ring-1 focus:ring-blue";
  const label = "text-xs text-ink-muted mb-1 block";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 max-w-lg">
      <div><label className={label}>Title *</label><input required className={field} value={form.title} onChange={set("title")} /></div>
      <div><label className={label}>Price (USD) *</label><input required type="number" step="0.01" min="0" className={field} value={form.price} onChange={set("price")} /></div>
      <div><label className={label}>Description</label><textarea rows={4} className={field} value={form.description} onChange={set("description")} /></div>
      <div><label className={label}>Thumbnail URL</label><input type="url" className={field} value={form.thumbnail} onChange={set("thumbnail")} /></div>
      <div className="flex gap-3">
        <div className="flex-1"><label className={label}>Series ID</label><input type="number" className={field} value={form.series_id} onChange={set("series_id")} /></div>
        <div className="flex-1"><label className={label}>Volume #</label><input type="number" className={field} value={form.volume_number} onChange={set("volume_number")} /></div>
      </div>
      <div><label className={label}>Co-author IDs (comma-separated)</label><input className={field} placeholder="e.g. 2,3" value={form.author_ids} onChange={set("author_ids")} /></div>
      <div><label className={label}>Genre IDs (comma-separated)</label><input className={field} placeholder="e.g. 1,2" value={form.genre_ids} onChange={set("genre_ids")} /></div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="py-2.5 bg-blue text-ink font-medium rounded-lg hover:bg-blue-deep transition-colors disabled:opacity-60">
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
