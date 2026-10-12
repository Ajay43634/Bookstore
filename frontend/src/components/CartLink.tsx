"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

export function CartLink() {
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Link href="/cart" className="relative text-bg-elevated hover:text-bg-base transition-colors text-sm font-medium">
      Cart
      {count > 0 && (
        <span className="absolute -top-1.5 -right-4 bg-yellow text-ink text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </Link>
  );
}
