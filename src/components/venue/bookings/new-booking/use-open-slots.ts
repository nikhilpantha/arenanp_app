import { useState } from 'react';

import { useVenueSubscriptions } from '@/lib/api/subscriptions';
import { useVenueBookings } from '@/lib/api/venue-bookings';
import { buildSlots } from '@/lib/booking-slots';
import { labelToMinutes } from '@/lib/time';
import type { DayOfWeek } from '@/types';

const DOW: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** "HH:mm" → minutes since midnight (null on bad input). */
function hhmmToMinutes(time: string): number | null {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/**
 * The open start-time slots for a court + date + duration, derived from the venue's
 * own bookings AND any active subscription that reserves a recurring slot on that
 * court/date. Auto-snaps `startTime` to the first open slot when the current pick is
 * no longer bookable (render-time reset, no effect needed).
 */
export function useOpenSlots(opts: {
  date: string;
  court: string;
  courtId?: string | null;
  duration: number;
  startTime: string;
  setStartTime: (t: string) => void;
  /** Exclude this booking's own slot from "occupied" (so editing keeps its time open). */
  excludeBookingId?: string;
}) {
  const { date, court, courtId, duration, startTime, setStartTime, excludeBookingId } = opts;
  const today = useVenueBookings('today');
  const upcoming = useVenueBookings('upcoming');
  const subs = useVenueSubscriptions();

  const bookingRanges = [...(today.data ?? []), ...(upcoming.data ?? [])]
    .filter(
      (b) => b.court === court && b.date === date && b.status !== 'cancelled' && b.id !== excludeBookingId,
    )
    .map((b) => ({ start: labelToMinutes(b.startLabel), end: labelToMinutes(b.endLabel) }))
    .filter((r): r is { start: number; end: number } => r.start != null && r.end != null);

  // A subscription occupies its daily slot on the chosen court when `date` falls inside
  // its window and on one of its weekdays.
  const weekday = DOW[new Date(`${date}T00:00:00`).getDay()];
  const subRanges = (subs.data ?? [])
    .filter(
      (s) =>
        !!courtId &&
        s.courtId === courtId &&
        (s.status === 'active' || s.status === 'paused' || s.status === 'scheduled') &&
        s.daysOfWeek.includes(weekday) &&
        new Date(s.startedAt) <= new Date(`${date}T23:59:59`) &&
        new Date(s.expiresAt) >= new Date(`${date}T00:00:00`),
    )
    .map((s) => {
      const start = hhmmToMinutes(s.slotStart);
      return start == null ? null : { start, end: start + s.sessionMinutes };
    })
    .filter((r): r is { start: number; end: number } => r != null);

  const occupied = [...bookingRanges, ...subRanges];

  const slots = buildSlots(date, duration, occupied);
  const openSlots = slots.filter((s) => s.available);
  const timeValid = openSlots.some((s) => s.value === startTime);

  const key = `${date}|${court}|${duration}`;
  const [prevKey, setPrevKey] = useState('');
  if (key !== prevKey) {
    setPrevKey(key);
    if (!timeValid) {
      const firstOpen = slots.find((s) => s.available);
      if (firstOpen) setStartTime(firstOpen.value);
    }
  }

  return { openSlots, timeValid };
}
