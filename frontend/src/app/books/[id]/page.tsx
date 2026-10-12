import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { SeriesVolumes } from "@/components/SeriesVolumes";
import { fetchBook } from "@/lib/api/books";
import { fetchSeries } from "@/lib/api/series";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let book;
  try { book = await fetchBook(Number(id)); } catch { notFound(); }

  const series = book.series ? await fetchSeries(book.series.id).catch(() => null) : null;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-ink-muted hover:text-ink transition-colors mb-6 inline-block">← Back to browse</Link>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Cover */}
        <div className="w-full md:w-64 shrink-0">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-bg-sunken">
            {book.thumbnail ? (
              <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-faint">No cover</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {book.series && book.volume_number != null && (
            <span className="inline-block mb-2 text-xs bg-yellow-soft text-yellow-deep px-2 py-0.5 rounded">
              {book.series.name} — Vol {book.volume_number}
            </span>
          )}

          <h1 className="text-3xl font-bold text-ink mb-2">{book.title}</h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {book.authors.map(a => (
              <Link key={a.id} href={`/authors/${a.id}`} className="text-sm bg-blue-soft text-blue-deep px-3 py-0.5 rounded hover:bg-blue transition-colors">
                {a.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {book.genres.map(g => (
              <span key={g.id} className="text-xs bg-green-soft text-green-deep px-2 py-0.5 rounded">{g.name}</span>
            ))}
          </div>

          {book.description && (
            <p className="text-ink-muted leading-relaxed mb-6">{book.description}</p>
          )}

          <p className="text-2xl font-bold text-ink mb-6">${book.price}</p>

          {book.publish_date && (
            <p className="text-xs text-ink-faint mb-4">Published {book.publish_date}</p>
          )}

          <AddToCart book={book} />
        </div>

        {/* Series sidebar */}
        {series && book.volume_number != null && (
          <div className="w-full md:w-52 shrink-0">
            <SeriesVolumes series={series} currentBookId={book.id} currentVolume={book.volume_number} />
          </div>
        )}
      </div>
    </main>
  );
}
