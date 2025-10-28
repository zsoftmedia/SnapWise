// src/utils/grouping.ts
export function computeGroupKey({
  caption,
  exif_time,
  created_at,
}: { caption?: string|null; exif_time?: string|null; created_at?: string }) {
  if (caption) {
    // very light parser; tune as needed
    const m = caption.match(/S(\d+)\s*F(\d+)\s*B(\w+)/i) || caption.match(/SITE-(\d+)\s*\|\s*FLOOR-(\d+)\s*\|\s*BEAM-([\w-]+)/i);
    if (m) return `S${m[1]}-F${m[2]}-B${m[3]}`.toUpperCase();
  }
  const ts = exif_time ?? created_at ?? new Date().toISOString();
  const d = new Date(ts);
  const y = d.getFullYear(), mth = `${d.getMonth()+1}`.padStart(2,'0'), day = `${d.getDate()}`.padStart(2,'0');
  return `${y}-${mth}-${day}`; // group by date if no code
}
