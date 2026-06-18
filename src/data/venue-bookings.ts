import type { RecurringBooking, SportType, VenueBooking } from '@/types';

// TODO(backend): today's, upcoming and recurring bookings come from the bookings API.
// Dates are seeded around 2026-06-02 ("today") so the lists read realistically.

export const TODAY_BOOKINGS: VenueBooking[] = [
  { id: 'tb1', customer: 'Dream FC', customerType: 'team', phone: '9801234567', sport: 'football', court: 'Football Ground', date: '2026-06-02', startLabel: '4 PM', endLabel: '5 PM', status: 'completed', payment: 'paid', amount: 3000 },
  { id: 'tb2', customer: 'Brothers FC', customerType: 'team', sport: 'football', court: 'Football Ground', date: '2026-06-02', startLabel: '5 PM', endLabel: '6 PM', status: 'checked-in', payment: 'paid', amount: 0, freeGame: true },
  { id: 'tb3', customer: 'Nikhil', customerType: 'individual', phone: '9812345678', sport: 'badminton', court: 'Badminton Court', date: '2026-06-02', startLabel: '6 PM', endLabel: '7 PM', status: 'upcoming', payment: 'pending', amount: 500 },
  { id: 'tb4', customer: 'Sita Maharjan', customerType: 'individual', phone: '9807654321', sport: 'futsal', court: 'Court 1', date: '2026-06-02', startLabel: '7 PM', endLabel: '8 PM', status: 'upcoming', payment: 'partial', amount: 1200 },
];

export const UPCOMING_BOOKINGS: VenueBooking[] = [
  { id: 'ub1', customer: 'Dream FC', customerType: 'team', phone: '9801234567', sport: 'football', court: 'Football Ground', date: '2026-06-12', startLabel: '6 PM', endLabel: '7 PM', status: 'upcoming', payment: 'paid', amount: 3000 },
  { id: 'ub2', customer: 'Lalitpur Smashers', customerType: 'team', sport: 'badminton', court: 'Badminton Court', date: '2026-06-13', startLabel: '7 PM', endLabel: '8 PM', status: 'upcoming', payment: 'pending', amount: 500 },
  { id: 'ub3', customer: 'Arjun Thapa', customerType: 'individual', phone: '9812345678', sport: 'cricket', court: 'Net 1', date: '2026-06-15', startLabel: '4 PM', endLabel: '5 PM', status: 'upcoming', payment: 'partial', amount: 800 },
];

export const RECURRING_BOOKINGS: RecurringBooking[] = [
  { id: 'rb1', customer: 'Dream FC', sport: 'football', court: '1 sport', cadence: 'Weekdays', timeLabel: '6 AM – 7 AM', packageName: 'Morning Saver', status: 'active', sessionLabel: '1 hr', packageAmount: 12000, startDate: 'Jun 1', renewalDate: 'Jun 30' },
  { id: 'rb2', customer: 'Thunderbolts FC', sport: 'futsal', court: '1 sport', cadence: 'Mon, Wed', timeLabel: '8 PM – 9 PM', packageName: 'All-Access Monthly', status: 'active', sessionLabel: '1 hr', packageAmount: 8000, startDate: 'May 28', renewalDate: 'Jun 28' },
  { id: 'rb3', customer: 'Lalitpur Smashers', sport: 'badminton', court: '1 sport', cadence: 'Tue, Thu', timeLabel: '7 AM – 8 AM', packageName: 'Morning Saver', status: 'paused', sessionLabel: '1 hr', packageAmount: 4000, startDate: 'May 20', renewalDate: 'Jun 20' },
];

/** Top-of-screen overview numbers. TODO(backend): aggregate from the bookings API. */
export const BOOKING_SUMMARY = {
  bookingsToday: 12,
  revenueToday: 28000,
  pendingPayments: 2,
  freeGamesDue: 1,
} as const;

/** Distinct sports across the venue's bookings (drives the sport filter, plus an "All"). */
export const BOOKING_SPORTS: SportType[] = Array.from(
  new Set([...TODAY_BOOKINGS, ...UPCOMING_BOOKINGS, ...RECURRING_BOOKINGS].map((b) => b.sport)),
);

/** Filters a booking list by the selected sport scope ('all' keeps everything). */
export function bySport<T extends { sport: SportType }>(items: T[], scope: SportType | 'all'): T[] {
  return scope === 'all' ? items : items.filter((b) => b.sport === scope);
}
