"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { AuthorSummary } from "@/lib/api/authors";

export function FilterPanel({ authors }: { authors: AuthorSummary[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const [genre, setGenre]             = useState(params.get("genre") ?? "");
  const [authorId, setAuthorId]       = useState(params.get("author_id") ?? "");
  const [publishedAfter, setAfter]    = useState(params.get("published_after") ?? "");
  const [publishedBefore, setBefore]  = useState(params.get("published_before") ?? "");

  const apply = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    const set = (k: string, v: string) => v ? next.set(k, v) : next.delete(k);
    set("genre", genre);
    set("author_id", authorId);
    set("published_after", publishedAfter);
    set("published_before", publishedBefore);
    next.delete("page");
    router.push(`/?${next.toString()}`);
  }, [genre, authorId, publishedAfter, publishedBefore, params, router]);

  const clear = useCallback(() => {
    setGenre(""); setAuthorId(""); setAfter(""); setBefore("");
    router.push("/");
  }, [router]);

  const label = "block text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1.5";
  const input = "w-full px-3 py-2 rounded-lg border border-bg-sunken bg-bg-base text-ink text-sm focus:outline-none focus:ring-2 focus:ring-blue transition-shadow";

  return (
    <aside className="w-56 shrink-0">
      <div className="bg-bg-elevated border border-bg-sunken rounded-2xl p-5 flex flex-col gap-5 shadow-sm sticky top-24">
        <h2 className="text-base font-bold text-ink">Filters</h2>

        <div>
          <label className={label}>Genre</label>
          <input className={input} value={genre} onChange={e => setGenre(e.target.value)} placeholder="e.g. Fantasy" />
        </div>

        <div>
          <label className={label}>Author</label>
          <select className={input} value={authorId} onChange={e => setAuthorId(e.target.value)}>
            <option value="">All authors</option>
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className={label}>Published after</label>
          <input type="date" className={input} value={publishedAfter} onChange={e => setAfter(e.target.value)} />
        </div>

        <div>
          <label className={label}>Published before</label>
          <input type="date" className={input} value={publishedBefore} onChange={e => setBefore(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button onClick={apply} className="w-full py-2.5 bg-blue-deep text-bg-base text-sm font-semibold rounded-xl hover:bg-ink transition-colors">
            Apply filters
          </button>
          <button onClick={clear} className="w-full py-2 border border-bg-sunken text-ink-muted text-sm rounded-xl hover:bg-bg-sunken transition-colors">
            Clear all
          </button>
        </div>
      </div>
    </aside>
  );
}
