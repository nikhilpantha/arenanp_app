/** Time / date helpers shared across booking, calendar and scheduling screens. */

/** Zero-pad a number to 2 digits ("6" → "06"). */
export const pad = (n: number): string => String(n).padStart(2, '0');

/** "6:00 PM" / "6 PM" → "18:00" (24h value). Returns null if unparseable. */
export function to24h(label?: string): string | null {
  const m = label?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ?? '00';
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${pad(h)}:${min}`;
}

/** "18:00" → "6:00 PM" for display. */
export function to12h(value: string): string {
  const [hStr, min] = value.split(':');
  const h24 = Number(hStr);
  const ap = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${min} ${ap}`;
}

/** Today's date as "YYYY-MM-DD" (local). */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse a "6:00 PM"-style label to minutes-since-midnight, or null if unparseable. */
export function labelToMinutes(label: string): number | null {
  const v = to24h(label);
  if (!v) return null;
  const [h, m] = v.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** "YYYY-MM-DD" + "18:00" → an ISO datetime at that local time. */
export function startIso(date: string, time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(`${date}T00:00:00`);
  d.setHours(h, m || 0, 0, 0);
  return d.toISOString();
}
