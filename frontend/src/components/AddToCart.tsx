"use client";

import { useCart } from "@/hooks/useCart";
import type { BookDetail } from "@/lib/api/books";

export function AddToCart({ book }: { book: BookDetail }) {
  const { addItem, items } = useCart();
  const inCart = items.some(i => i.id === book.id);

  return (
    <button
      onClick={() => addItem({ id: book.id, title: book.title, price: book.price, thumbnail: book.thumbnail })}
      disabled={inCart}
      className="w-full py-3 rounded-lg bg-blue text-ink font-medium hover:bg-blue-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {inCart ? "Added to cart ✓" : "Add to cart"}
    </button>
  );
}
