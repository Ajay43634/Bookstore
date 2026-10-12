import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAuthor } from "@/lib/api/authors";

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let author;
  try { author = await fetchAuthor(Number(id)); } catch { notFound(); }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-ink-muted hover:text-ink transition-colors mb-6 inline-block">← Back to browse</Link>

      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        {/* Avatar */}
        <div className="w-28 h-28 shrink-0 rounded-full overflow-hidden bg-bg-sunken flex items-center justify-center">
          {author.profile_picture ? (
            <img src={author.profile_picture} alt={author.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-ink-faint">{author.name[0]}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-ink mb-1">{author.name}</h1>
          {author.nationality && (
            <p className="text-sm text-ink-muted mb-3">{author.nationality}</p>
          )}
          {author.bio && (
            <p className="text-ink-muted leading-relaxed">{author.bio}</p>
          )}
        </div>
      </div>

      {/* Books */}
      <h2 className="text-lg font-semibold text-ink mb-4">Books by {author.name}</h2>
      {author.books.length === 0 ? (
        <p className="text-ink-faint">No books yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {author.books.map(book => (
            <Link key={book.id} href={`/books/${book.id}`} className="group block rounded-lg bg-bg-elevated border border-bg-sunken overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[2/3] bg-bg-sunken overflow-hidden">
                {book.thumbnail ? (
                  <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-faint text-xs">No cover</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-ink text-sm font-medium line-clamp-2 group-hover:text-blue-deep transition-colors">{book.title}</p>
                <p className="text-ink-muted text-sm mt-1">${book.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
