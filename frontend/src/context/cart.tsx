"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface CartItem { id: number; title: string; price: string; thumbnail: string | null; qty: number; }

const KEY = "bookstore_cart";

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

function save(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

interface CartContextValue {
  items: CartItem[];
  addItem: (book: Omit<CartItem, "qty">) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => { setItems(load()); }, []);

  const addItem = useCallback((book: Omit<CartItem, "qty">) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === book.id);
      const next = existing
        ? prev.map(i => i.id === book.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...book, qty: 1 }];
      save(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(prev => { const next = prev.filter(i => i.id !== id); save(next); return next; });
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    setItems(prev => {
      const next = qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty } : i);
      save(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => { save([]); setItems([]); }, []);

  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
