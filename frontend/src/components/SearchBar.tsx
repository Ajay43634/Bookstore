"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  const submit = useCallback(() => {
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set("q", value.trim()); else next.delete("q");
    next.delete("page");
    router.push(`/?${next.toString()}`);
  }, [value, params, router]);

  return (
    <div className="flex gap-3">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        placeholder="Search by title…"
        className="flex-1 px-5 py-3 rounded-xl border border-bg-sunken bg-bg-elevated text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-blue text-sm shadow-sm"
      />
      <button
        onClick={submit}
        className="px-6 py-3 bg-blue-deep text-bg-base font-semibold rounded-xl hover:bg-ink transition-colors text-sm shadow-sm"
      >
        Search
      </button>
    </div>
  );
}
