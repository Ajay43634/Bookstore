import Link from "next/link";
import type { SeriesDetail } from "@/lib/api/series";

interface Props {
  series: SeriesDetail;
  currentBookId: number;
  currentVolume: number;
}

export function SeriesVolumes({ series, currentBookId, currentVolume }: Props) {
  const sorted = [...series.volumes].sort((a, b) => a.volume_number - b.volume_number);
  const idx = sorted.findIndex(v => v.id === currentBookId);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <div className="rounded-lg bg-bg-elevated border border-bg-sunken p-4">
      <h3 className="text-sm font-semibold text-ink mb-3">
        Part of <span className="text-blue-deep">{series.name}</span>
      </h3>

      <div className="flex flex-col gap-2 mb-4">
        {sorted.map(v => (
          <Link
            key={v.id}
            href={`/books/${v.id}`}
            className={`flex items-center gap-3 rounded px-2 py-1.5 text-sm transition-colors ${
              v.id === currentBookId
                ? "bg-yellow-soft text-ink font-medium"
                : "text-ink-muted hover:bg-bg-sunken"
            }`}
          >
            <span className="w-6 text-center text-xs text-ink-faint">#{v.volume_number}</span>
            <span className="line-clamp-1">{v.title}</span>
          </Link>
        ))}
      </div>

      <div className="flex gap-2">
        {prev && (
          <Link href={`/books/${prev.id}`} className="flex-1 text-center text-xs py-1.5 rounded border border-bg-sunken text-ink-muted hover:bg-bg-sunken transition-colors">
            ← Vol {prev.volume_number}
          </Link>
        )}
        {next && (
          <Link href={`/books/${next.id}`} className="flex-1 text-center text-xs py-1.5 rounded bg-blue text-ink hover:bg-blue-deep transition-colors">
            Vol {next.volume_number} →
          </Link>
        )}
      </div>
    </div>
  );
}
