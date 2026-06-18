import { pad, to12h, todayIso } from './time';

/** A start-time option in the booking slot grid. */
export interface TimeSlot {
  /** 24h start, e.g. "18:00". */
  value: string;
  /** Display label, e.g. "6:00 PM". */
  label: string;
  available: boolean;
  /** Why it's unavailable (drives the styling). */
  reason?: 'booked' | 'past';
}

// Slot grid window + granularity. (A future enhancement: derive open/close from the venue.)
const DAY_OPEN = 6 * 60; // 06:00
const DAY_CLOSE = 23 * 60; // 23:00
const SLOT_STEP = 30; // minutes between start options

/**
 * Build the start-time slots for a day, marking booked/past ones unavailable. `occupied`
 * is the set of taken [start, end) ranges (minutes-since-midnight) for the court + date.
 */
export function buildSlots(
  date: string,
  durationHours: number,
  occupied: { start: number; end: number }[],
): TimeSlot[] {
  const durMin = durationHours * 60;
  const now = new Date();
  const isToday = date === todayIso();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const out: TimeSlot[] = [];
  for (let t = DAY_OPEN; t + durMin <= DAY_CLOSE; t += SLOT_STEP) {
    const end = t + durMin;
    // Overlap test: [t, end) intersects any occupied [start, end).
    const booked = occupied.some((r) => t < r.end && end > r.start);
    const past = isToday && t < nowMin;
    const value = `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
    out.push({
      value,
      label: to12h(value),
      available: !booked && !past,
      reason: booked ? 'booked' : past ? 'past' : undefined,
    });
  }
  return out;
}
