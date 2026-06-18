import type { IconName } from '@/components/common';
import type { DayOfWeek, PaymentMethod, PaymentStatus } from '@/types';

/** Tabs on the venue bookings screen. */
export const TAB = {
  today: 'today',
  upcoming: 'upcoming',
  requests: 'requests',
  recurring: 'recurring',
} as const;

export type Tab = (typeof TAB)[keyof typeof TAB];

/** Weekday keys, Sunday-first to match `Date.getDay()`. */
export const DOW: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Payment status choices, shown as selectable cards (pending is the default). */
export const PAYMENT_OPTIONS: { value: PaymentStatus; label: string; hint: string; icon: IconName }[] =
  [
    { value: 'pending', label: 'Pending', hint: 'Collect at the venue later', icon: 'clock' },
    { value: 'partial', label: 'Partial', hint: 'Some now, the rest later', icon: 'dollarSign' },
    { value: 'paid', label: 'Paid', hint: 'Paid in full', icon: 'check' },
  ];

/** Payment methods offered once money is received (paid / partial). */
export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'esewa', label: 'eSewa' },
  { value: 'khalti', label: 'Khalti' },
  { value: 'card', label: 'Card' },
];
