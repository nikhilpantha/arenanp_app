import type { VenueClosure } from '@/lib/api/closures';

/** Asia/Kathmandu is a fixed UTC+05:45 offset (no DST) — a constant suffices. */
const NEPAL_OFFSET_MIN = 5 * 60 + 45;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A Nepal-local day ("YYYY-MM-DD") + "HH:mm" → the absolute UTC instant as an ISO string. */
export function nepalWallToUtcISO(dateIso: string, hhmm: string): string {
  const [y, mo, d] = dateIso.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  const ms = Date.UTC(y, mo - 1, d, h, mi) - NEPAL_OFFSET_MIN * 60_000;
  return new Date(ms).toISOString();
}

/** Nepal-local parts of an absolute instant. */
function nepalParts(iso: string): { y: number; mo: number; d: number; min: number } {
  const shifted = new Date(new Date(iso).getTime() + NEPAL_OFFSET_MIN * 60_000);
  return {
    y: shifted.getUTCFullYear(),
    mo: shifted.getUTCMonth(),
    d: shifted.getUTCDate(),
    min: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

/** Minutes-since-midnight → "6 AM" / "2:30 PM". */
function clock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

const dateLabel = (p: { mo: number; d: number }): string => `${MONTHS[p.mo]} ${p.d}`;

/**
 * Friendly Nepal-local window for a closure card. Single day → "Jun 20 · 2 PM – 5 PM";
 * spanning days → "Jun 20 – Jun 22" (the exclusive end midnight belongs to the prior day).
 */
export function formatClosureWindow(c: Pick<VenueClosure, 'startAt' | 'endAt'>): string {
  const s = nepalParts(c.startAt);
  const e = nepalParts(c.endAt);
  const sameDay = s.y === e.y && s.mo === e.mo && s.d === e.d;
  const fullDay = s.min === 0 && e.min === 0;
  if (sameDay && !fullDay) return `${dateLabel(s)} · ${clock(s.min)} – ${clock(e.min)}`;
  const lastDay = nepalParts(new Date(new Date(c.endAt).getTime() - 60_000).toISOString());
  const start = dateLabel(s);
  const end = dateLabel(lastDay);
  return start === end ? start : `${start} – ${end}`;
}
