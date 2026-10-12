"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiMe } from "@/lib/api/auth";
import type { AuthorMe } from "@/lib/api/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [author, setAuthor] = useState<AuthorMe | null | "loading">("loading");

  useEffect(() => {
    apiMe().then(me => {
      if (!me) { router.replace("/login"); } else { setAuthor(me); }
    });
  }, [router]);

  if (author === "loading") {
    return <div className="flex items-center justify-center min-h-screen text-ink-muted">Loading…</div>;
  }

  return <>{children}</>;
}
