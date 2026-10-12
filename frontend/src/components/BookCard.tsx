import Link from "next/link";
import type { BookSummary } from "@/lib/api/books";

export function BookCard({ book }: { book: BookSummary }) {
  const primaryAuthor = book.authors[0];

  return (
    <Link href={`/books/${book.id}`} className="group block rounded-2xl bg-bg-elevated border border-bg-sunken overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="aspect-[2/3] bg-bg-sunken overflow-hidden">
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-faint text-sm font-medium">No cover</div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-ink font-bold text-sm leading-snug line-clamp-2 group-hover:text-blue-deep transition-colors">
          {book.title}
        </h3>
        {primaryAuthor && (
          <p className="text-ink-muted text-xs font-medium">{primaryAuthor.name}</p>
        )}
        <div className="flex flex-wrap gap-1">
          {book.genres.slice(0, 2).map(g => (
            <span key={g.id} className="text-xs bg-green-soft text-green-deep px-2.5 py-0.5 rounded-full font-medium">
              {g.name}
            </span>
          ))}
        </div>
        <p className="text-blue-deep font-bold text-sm">${book.price}</p>
      </div>
    </Link>
  );
}
