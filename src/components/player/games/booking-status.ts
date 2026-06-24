import type { BadgeVariant } from '@/components/common';
import type { ApiBookingStatus } from '@/lib/api/operations';

interface StatusMeta {
  label: string;
  variant: BadgeVariant;
}

const META: Record<ApiBookingStatus, StatusMeta> = {
  PENDING_PAYMENT: { label: 'Pending', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  CHECKED_IN: { label: 'Checked in', variant: 'info' },
  COMPLETED: { label: 'Completed', variant: 'neutral' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
  NO_SHOW: { label: 'No-show', variant: 'danger' },
};

/** Player-facing badge for a booking's lifecycle status (keeps Pending vs Confirmed). */
export function playerBookingStatus(status: ApiBookingStatus): StatusMeta {
  return META[status];
}

const TERMINAL: ApiBookingStatus[] = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

/** Whether a booking is still cancellable (not in a terminal state). */
export function isCancellable(status: ApiBookingStatus): boolean {
  return !TERMINAL.includes(status);
}

/** Whether a booking belongs in the "Upcoming" tab (active states, not ended). */
export function isUpcoming(status: ApiBookingStatus): boolean {
  return status === 'PENDING_PAYMENT' || status === 'CONFIRMED' || status === 'CHECKED_IN';
}
