import type { CalendarBooking, VenueCourtOption } from '@/lib/api/venue-bookings';
import { pad, to12h } from '@/lib/time';
import type { Slot, SlotStatus } from '@/types';

// Day window for the grid (matches the slot-generation window used elsewhere). A future
// enhancement: derive from the venue's open/close hours.
const DAY_OPEN = 6 * 60; // 06:00
const DAY_CLOSE = 23 * 60; // 23:00

const SOURCE_STATUS: Record<CalendarBooking['source'], SlotStatus> = {
  ONLINE: 'online',
  WALK_IN: 'walkin',
  SUBSCRIPTION: 'subscription',
};

/** Minutes-since-midnight of an ISO instant, in the device's local time (matches timeLabel). */
function localMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** One grid row: the slot plus the booking that occupies it (absent → an empty slot). */
export interface SlotEntry {
  slot: Slot;
  /** 24h start ("HH:mm") of this slot — passed to the booking form when tapping an empty slot. */
  start24: string;
  booking?: CalendarBooking;
}

export interface CourtSchedule {
  court: VenueCourtOption;
  entries: SlotEntry[];
}

/**
 * Build a per-court day grid (06:00–23:00 at each court's slot length), overlaying the
 * day's bookings. A slot with no booking is `available` (empty → tappable to book); a
 * booked slot carries the booker's name + a source-coded status (online / walk-in / member)
 * and its `booking` so the row can open that booking's detail.
 */
export function buildCourtSchedules(
  courts: VenueCourtOption[],
  bookings: CalendarBooking[],
): CourtSchedule[] {
  return courts.map((court) => {
    const step = court.slotMinutes > 0 ? court.slotMinutes : 60;
    const courtBookings = bookings.filter((b) => b.courtId === court.id);
    const entries: SlotEntry[] = [];

    for (let t = DAY_OPEN; t + step <= DAY_CLOSE; t += step) {
      const slotEnd = t + step;
      const booking = courtBookings.find((b) => {
        const bStart = localMinutes(b.startAt);
        let bEnd = localMinutes(b.endAt);
        if (bEnd <= bStart) bEnd += 24 * 60; // guard (midnight-crossing is blocked upstream)
        return bStart < slotEnd && bEnd > t;
      });
      const hhmm = `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
      entries.push({
        start24: hhmm,
        booking,
        slot: {
          id: `${court.id}-${t}`,
          time: to12h(hhmm),
          court: court.name,
          status: booking ? SOURCE_STATUS[booking.source] : 'available',
          customerName: booking?.customer,
        },
      });
    }
    return { court, entries };
  });
}
