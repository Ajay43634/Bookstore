const BASE = process.env.INTERNAL_API_BASE ?? "http://localhost:4000/api/v1";

export interface VolumeRef { id: number; title: string; volume_number: number; thumbnail: string | null; price: string; }
export interface SeriesDetail { id: number; name: string; description: string | null; volumes: VolumeRef[]; }

export async function fetchSeries(id: number): Promise<SeriesDetail> {
  const res = await fetch(`${BASE}/series/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Series not found");
  return res.json();
}
