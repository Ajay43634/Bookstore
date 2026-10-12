"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000/api/v1";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${apiBase}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: items.map(i => ({ book_id: i.id, qty: i.qty })) }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const data = await res.json();
      clearCart();
      setOrderId(data.order_id);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <main className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-ink mb-2">Order confirmed!</h1>
        <p className="text-ink-muted mb-2">Your order ID is <span className="font-mono font-bold text-ink">{orderId}</span>.</p>
        <p className="text-sm text-ink-faint mb-8">(This is a mock — no payment was taken.)</p>
        <Link href="/" className="text-blue-deep hover:underline text-sm">Continue browsing →</Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-ink-muted mb-4">Your cart is empty.</p>
        <Link href="/" className="text-blue-deep hover:underline text-sm">Browse books →</Link>
      </main>
    );
  }

  const field = "w-full px-3 py-2 rounded border border-bg-sunken bg-bg-elevated text-ink text-sm focus:outline-none focus:ring-1 focus:ring-blue";

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-ink mb-8">Checkout</h1>

      <div className="bg-bg-elevated border border-bg-sunken rounded-lg p-4 mb-6">
        {items.map(i => (
          <div key={i.id} className="flex justify-between text-sm py-1">
            <span className="text-ink">{i.title} × {i.qty}</span>
            <span className="text-ink-muted">${(parseFloat(i.price) * i.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-bg-sunken mt-2 pt-2 flex justify-between font-semibold text-ink">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div><label className="text-xs text-ink-muted mb-1 block">Full name</label><input required className={field} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div><label className="text-xs text-ink-muted mb-1 block">Email</label><input required type="email" className={field} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
        <div><label className="text-xs text-ink-muted mb-1 block">Shipping address</label><textarea required rows={3} className={field} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="py-3 bg-blue text-ink font-medium rounded-lg hover:bg-blue-deep transition-colors disabled:opacity-60">
          {loading ? "Placing order…" : "Place order (mock)"}
        </button>
      </form>
    </main>
  );
}
