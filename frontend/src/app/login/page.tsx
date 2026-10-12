"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiLogin } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      await apiLogin(form.email, form.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  const field = "w-full px-3 py-2 rounded border border-bg-sunken bg-bg-elevated text-ink text-sm focus:outline-none focus:ring-1 focus:ring-blue";

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <h1 className="text-2xl font-bold text-ink mb-8">Sign in</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div><label className="text-xs text-ink-muted mb-1 block">Email</label><input required type="email" className={field} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
        <div><label className="text-xs text-ink-muted mb-1 block">Password</label><input required type="password" className={field} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="py-2.5 bg-blue text-ink font-medium rounded-lg hover:bg-blue-deep transition-colors disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-ink-muted mt-6 text-center">
        No account? <Link href="/register" className="text-blue-deep hover:underline">Register</Link>
      </p>
    </main>
  );
}
