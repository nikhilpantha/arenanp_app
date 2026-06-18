import type { BadgeVariant } from '@/components/common';
import type { BookingStatus, PaymentStatus, RecurringStatus, VenueBooking } from '@/types';

export interface BadgeMeta {
  label: string;
  variant: BadgeVariant;
}

const STATUS_META: Record<BookingStatus, BadgeMeta> = {
  upcoming: { label: 'Upcoming', variant: 'info' },
  'checked-in': { label: 'Checked In', variant: 'success' },
  completed: { label: 'Completed', variant: 'neutral' },
  'no-show': { label: 'No Show', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
};

const PAYMENT_META: Record<PaymentStatus, BadgeMeta> = {
  paid: { label: 'Paid', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  partial: { label: 'Partially Paid', variant: 'info' },
};

const RECURRING_META: Record<RecurringStatus, BadgeMeta> = {
  active: { label: 'Active', variant: 'success' },
  paused: { label: 'Paused', variant: 'warning' },
  expired: { label: 'Expired', variant: 'danger' },
};

export const statusBadge = (s: BookingStatus): BadgeMeta => STATUS_META[s];
export const recurringBadge = (s: RecurringStatus): BadgeMeta => RECURRING_META[s];

/** Membership badge — terminal/derived states win; otherwise "Active". */
export const subscriptionBadge = (
  status: 'scheduled' | 'active' | 'paused' | 'cancelled' | 'expired',
  expiringSoon: boolean,
): BadgeMeta => {
  if (status === 'scheduled') return { label: 'Upcoming', variant: 'info' };
  if (status === 'paused') return { label: 'Paused', variant: 'neutral' };
  if (status === 'expired') return { label: 'Expired', variant: 'danger' };
  if (status === 'cancelled') return { label: 'Cancelled', variant: 'danger' };
  if (expiringSoon) return { label: 'Expiring soon', variant: 'warning' };
  return { label: 'Active', variant: 'success' };
};

/** The money badge — a free loyalty game wins over the raw payment state. */
export const paymentBadge = (b: Pick<VenueBooking, 'payment' | 'freeGame'>): BadgeMeta =>
  b.freeGame ? { label: 'Free Game', variant: 'success' } : PAYMENT_META[b.payment];

// Legacy statuses coming from the calendar's slot grid (not lifecycle statuses).
const SLOT_STATUS_LABEL: Record<string, string> = {
  online: 'Online booking',
  walkin: 'Walk-in',
  subscription: 'Membership',
  maintenance: 'Blocked',
};

const BOOKING_STATUSES = Object.keys(STATUS_META) as BookingStatus[];
const PAYMENT_STATUSES = Object.keys(PAYMENT_META) as PaymentStatus[];

/** Resolve a status param from either a lifecycle status or a legacy slot status. */
export function resolveStatusBadge(status?: string): BadgeMeta {
  if (BOOKING_STATUSES.includes(status as BookingStatus)) return statusBadge(status as BookingStatus);
  return { label: SLOT_STATUS_LABEL[status ?? ''] ?? 'Booking', variant: 'info' };
}

/** Resolve a payment param into a badge (null when the param isn't a known payment state). */
export function resolvePaymentBadge(payment?: string, freeGame?: boolean): BadgeMeta | null {
  if (!PAYMENT_STATUSES.includes(payment as PaymentStatus)) return null;
  return paymentBadge({ payment: payment as PaymentStatus, freeGame: !!freeGame });
}
