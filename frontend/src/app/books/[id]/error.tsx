"use client";

import Link from "next/link";

export default function Error({ error }: { error: Error }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <p className="text-xl font-semibold text-ink mb-2">Book not found</p>
      <p className="text-ink-muted text-sm mb-6">{error.message || "This book could not be loaded."}</p>
      <Link href="/" className="text-sm text-blue-deep hover:underline">← Back to browse</Link>
    </div>
  );
}
