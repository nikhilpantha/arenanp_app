import type { IconName } from '@/components/common';
import type { Team } from '@/types';

import { TEAMS } from './teams';

// TODO(backend): all dashboard data is mock until the bookings/analytics API lands.

export const VENUE_NAME = 'Arena Futsal';

const bookings = 12;
const completed = 7;

/** Today's game counts — total booked, already played, and still to be played. */
export const TODAY = {
  bookings,
  completed,
  pending: bookings - completed,
  revenueLabel: 'Rs 8.4k',
} as const;

export interface UpNextItem {
  id: string;
  sport: string;
  court: string;
  customer: string;
  time: string;
  startsIn: string;
  icon: IconName;
}

export const UP_NEXT: UpNextItem[] = [
  { id: '1', sport: 'Futsal', court: 'Court 1', customer: 'Ramesh K.', time: '5:00 PM', startsIn: 'in 25 min', icon: 'activity' },
  { id: '2', sport: 'Basketball', court: 'Court 2', customer: 'Sita M.', time: '6:00 PM', startsIn: 'in 1h 25m', icon: 'trophy' },
  { id: '3', sport: 'Cricket', court: 'Net 1', customer: 'Arjun T.', time: '7:30 PM', startsIn: 'in 2h 55m', icon: 'activity' },
];

export interface RecurringSlot {
  id: string;
  holder: string;
  sport: string;
  court: string;
  cadence: string; // e.g. "Every Mon · Wed"
  time: string;
}

// Subscription / membership slots that repeat — the owner should keep these reserved.
export const RECURRING_SLOTS: RecurringSlot[] = [
  { id: 'r1', holder: 'Thunderbolts FC', sport: 'Futsal', court: 'Court 1', cadence: 'Every Mon · Wed', time: '6:00 PM' },
  { id: 'r2', holder: 'Lalitpur Smashers', sport: 'Badminton', court: 'Court 1', cadence: 'Every Tue', time: '7:00 PM' },
  { id: 'r3', holder: 'Arjun T. · All-Access', sport: 'Cricket', court: 'Net 1', cadence: 'Every Sat', time: '4:00 PM' },
];

export interface QuickLink {
  key: string;
  label: string;
  icon: IconName;
}

export const QUICK_LINKS: QuickLink[] = [
  { key: 'add', label: 'Add booking', icon: 'calendarDays' },
  { key: 'reviews', label: 'Reviews', icon: 'star' },
  { key: 'customers', label: 'Customers', icon: 'users' },
  { key: 'support', label: 'Support', icon: 'helpCircle' },
];

export interface WeekPoint {
  day: string;
  matches: number;
  revenue: number;
}

export const WEEK: WeekPoint[] = [
  { day: 'Mon', matches: 6, revenue: 7200 },
  { day: 'Tue', matches: 8, revenue: 9100 },
  { day: 'Wed', matches: 5, revenue: 6400 },
  { day: 'Thu', matches: 9, revenue: 10200 },
  { day: 'Fri', matches: 11, revenue: 13800 },
  { day: 'Sat', matches: 14, revenue: 16800 },
  { day: 'Sun', matches: 10, revenue: 11500 },
];

/** Top teams by lifetime games played at the venue. */
export const TOP_TEAMS: Team[] = [...TEAMS].sort((a, b) => b.totalGames - a.totalGames).slice(0, 3);
