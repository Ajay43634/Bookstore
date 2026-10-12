"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <p className="text-xl font-semibold text-ink">Something went wrong</p>
      <p className="text-ink-muted text-sm max-w-sm">{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset} className="px-4 py-2 bg-blue text-ink text-sm font-medium rounded-lg hover:bg-blue-deep transition-colors">
        Try again
      </button>
    </div>
  );
}
