import { Suspense } from "react";
import { BookCard } from "@/components/BookCard";
import { FilterPanel } from "@/components/FilterPanel";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { fetchBooks } from "@/lib/api/books";
import { fetchAuthors } from "@/lib/api/authors";

interface SearchParams { q?: string; author_id?: string; genre?: string; published_after?: string; published_before?: string; page?: string; }

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const [booksResult, authorsResult] = await Promise.all([
    fetchBooks({ ...sp, page: String(page), page_size: "20" }),
    fetchAuthors(),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Search bar */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-4">Browse Books</h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex gap-8 items-start">
        {/* Filter sidebar */}
        <Suspense>
          <FilterPanel authors={authorsResult.data} />
        </Suspense>

        {/* Book grid */}
        <div className="flex-1 min-w-0">
          <p className="text-ink-muted text-sm mb-5 font-medium">
            {booksResult.total === 0 ? "No books found" : `${booksResult.total} book${booksResult.total !== 1 ? "s" : ""} found`}
          </p>

          {booksResult.data.length === 0 ? (
            <div className="py-24 text-center text-ink-faint bg-bg-elevated rounded-2xl border border-bg-sunken">
              <p className="text-lg font-medium">No books match your search.</p>
              <p className="text-sm mt-2">Try adjusting or clearing the filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {booksResult.data.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          <Suspense>
            <Pagination total={booksResult.total} page={page} pageSize={booksResult.page_size} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
