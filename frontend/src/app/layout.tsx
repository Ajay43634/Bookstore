import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { CartLink } from "@/components/CartLink";
import { CartProvider } from "@/context/cart";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "BookStore",
  description: "Discover and purchase books",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-bg-base text-ink">
        <CartProvider>
          <header className="sticky top-0 z-10 bg-ink shadow-md">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-bg-base tracking-tight hover:text-bg-elevated transition-colors">
                BookStore
              </Link>
              <nav className="flex items-center gap-8 text-sm font-medium">
                <Link href="/" className="text-bg-elevated hover:text-bg-base transition-colors">Browse</Link>
                <CartLink />
                <Link href="/login" className="px-4 py-1.5 rounded-full border border-bg-sunken text-bg-elevated hover:bg-bg-sunken hover:text-ink transition-colors text-sm">
                  Sign in
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
