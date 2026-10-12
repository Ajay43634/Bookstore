"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCart();

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-2xl text-ink-faint mb-4">Your cart is empty.</p>
        <Link href="/" className="text-blue-deep hover:underline text-sm">Browse books →</Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-ink mb-8">Your Cart</h1>

      <div className="flex flex-col gap-4 mb-8">
        {items.map(item => (
          <div key={item.id} className="flex gap-4 bg-bg-elevated border border-bg-sunken rounded-lg p-4">
            <div className="w-14 h-20 shrink-0 rounded overflow-hidden bg-bg-sunken">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-faint text-xs">—</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/books/${item.id}`} className="text-ink font-medium hover:text-blue-deep transition-colors line-clamp-1">
                {item.title}
              </Link>
              <p className="text-ink-muted text-sm mt-0.5">${item.price} each</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 rounded border border-bg-sunken text-ink-muted hover:bg-bg-sunken transition-colors text-sm">−</button>
                <span className="text-sm text-ink w-6 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 rounded border border-bg-sunken text-ink-muted hover:bg-bg-sunken transition-colors text-sm">+</button>
              </div>
            </div>
            <div className="text-right flex flex-col justify-between">
              <p className="text-ink font-medium">${(parseFloat(item.price) * item.qty).toFixed(2)}</p>
              <button onClick={() => removeItem(item.id)} className="text-xs text-ink-faint hover:text-ink transition-colors">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-bg-sunken pt-4 flex items-center justify-between mb-6">
        <span className="text-ink font-semibold">Total</span>
        <span className="text-xl font-bold text-ink">${total.toFixed(2)}</span>
      </div>

      <Link href="/checkout" className="block w-full py-3 text-center bg-blue text-ink font-medium rounded-lg hover:bg-blue-deep transition-colors">
        Proceed to checkout →
      </Link>
    </main>
  );
}
