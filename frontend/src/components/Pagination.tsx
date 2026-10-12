"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props { total: number; page: number; pageSize: number }

export function Pagination({ total, page, pageSize }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const go = (p: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`/?${next.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="px-4 py-1.5 rounded border border-bg-sunken text-ink text-sm disabled:opacity-40 hover:bg-bg-sunken transition-colors"
      >
        ← Prev
      </button>
      <span className="text-ink-muted text-sm">Page {page} of {totalPages}</span>
      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-1.5 rounded border border-bg-sunken text-ink text-sm disabled:opacity-40 hover:bg-bg-sunken transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
