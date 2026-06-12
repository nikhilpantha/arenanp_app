import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { primaryVenueMembership } from '@/lib/panels';
import { useActiveVenueStore, useAuthStore } from '@/stores';
import type { BookingStatus, CustomerType, PaymentStatus, SportType, VenueBooking } from '@/types';

import { gqlRequest, isApiConfigured } from './client';
import {
  type ApiBooking,
  type ApiBookingPaymentStatus,
  type ApiBookingStatus,
  type ApiBookingSummary,
  type ApiCourt,
  type ApiCustomerType,
  CREATE_VENUE_BOOKING,
  MY_VENUE_COURTS,
  SET_VENUE_BOOKING_STATUS,
  VENUE_BOOKING_SUMMARY,
  VENUE_BOOKINGS,
} from './operations';

/**
 * The venue id the panel is currently operating under. Resolves the venue chosen
 * in the switcher when it's still a valid membership; otherwise the first venue.
 */
export function useActiveVenueId(): string | undefined {
  const profile = useAuthStore((s) => s.profile);
  const activeVenueId = useActiveVenueStore((s) => s.activeVenueId);
  const memberships = profile?.venueMemberships ?? [];
  const selected = memberships.find((m) => m.venueId === activeVenueId);
  return (selected ?? primaryVenueMembership(profile))?.venueId;
}

// ── Backend → app shape mapping ──────────────────────────────────────────────

const STATUS_MAP: Record<ApiBookingStatus, BookingStatus> = {
  PENDING_PAYMENT: 'upcoming',
  CONFIRMED: 'upcoming',
  CHECKED_IN: 'checked-in',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
};
const PAYMENT_MAP: Record<ApiBookingPaymentStatus, PaymentStatus> = {
  PAID: 'paid',
  PENDING: 'pending',
  PARTIAL: 'partial',
};
const CUSTOMER_TYPE_MAP: Record<ApiCustomerType, CustomerType> = {
  TEAM: 'team',
  INDIVIDUAL: 'individual',
  CLUB: 'club',
};

/** The app status action → backend BookingStatusAction. */
const ACTION_MAP: Partial<Record<BookingStatus, 'CHECKED_IN' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'>> = {
  'checked-in': 'CHECKED_IN',
  completed: 'COMPLETED',
  'no-show': 'NO_SHOW',
  cancelled: 'CANCELLED',
};

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hr}:${String(m).padStart(2, '0')} ${period}` : `${hr} ${period}`;
}

export function mapApiBooking(b: ApiBooking): VenueBooking {
  return {
    id: b.id,
    customer: b.customerName ?? 'Walk-in',
    customerType: CUSTOMER_TYPE_MAP[b.customerType],
    phone: b.customerPhone ?? undefined,
    sport: b.sport.slug as SportType,
    court: b.courtName,
    date: b.startAt.slice(0, 10),
    startLabel: timeLabel(b.startAt),
    endLabel: timeLabel(b.endAt),
    status: STATUS_MAP[b.status],
    payment: PAYMENT_MAP[b.paymentStatus],
    amount: b.total,
    freeGame: b.freeGame,
  };
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/** True when live booking data should be used (API configured + a venue resolved). */
export function useBookingsApiEnabled(): boolean {
  const venueId = useActiveVenueId();
  return isApiConfigured && !!venueId;
}

export function useVenueBookings(scope: 'today' | 'upcoming') {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['venueBookings', venueId, scope],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<VenueBooking[]> => {
      const r = await gqlRequest<{ venueBookings: ApiBooking[] }>(VENUE_BOOKINGS, {
        input: { venueId, scope: scope === 'today' ? 'TODAY' : 'UPCOMING' },
      });
      return r.venueBookings.map(mapApiBooking);
    },
  });
}

export interface VenueCourtOption {
  id: string;
  name: string;
  sportSlug: SportType;
  sportLabel: string;
  pricePerHour: number;
  slotMinutes: number;
}

export function useVenueCourts() {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['myVenueCourts', venueId],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<VenueCourtOption[]> => {
      const r = await gqlRequest<{ myVenue: { courts: ApiCourt[] } }>(MY_VENUE_COURTS, { venueId });
      return r.myVenue.courts.map((c) => ({
        id: c.id,
        name: c.name,
        sportSlug: c.sport.slug as SportType,
        sportLabel: c.sport.name,
        pricePerHour: c.pricePerHour,
        slotMinutes: c.slotMinutes,
      }));
    },
  });
}

export function useVenueBookingSummary() {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['venueBookingSummary', venueId],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<ApiBookingSummary> => {
      const r = await gqlRequest<{ venueBookingSummary: ApiBookingSummary }>(VENUE_BOOKING_SUMMARY, {
        venueId,
      });
      return r.venueBookingSummary;
    },
  });
}

export function useSetBookingStatus() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { bookingId: string; status: BookingStatus; note?: string }) => {
      const action = ACTION_MAP[vars.status];
      if (!action) throw new Error(`Unsupported status action: ${vars.status}`);
      return gqlRequest(SET_VENUE_BOOKING_STATUS, {
        input: { venueId, bookingId: vars.bookingId, status: action, note: vars.note },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venueBookings', venueId] });
      qc.invalidateQueries({ queryKey: ['venueBookingSummary', venueId] });
    },
  });
}

export interface CreateBookingVars {
  courtId: string;
  customerName: string;
  customerPhone?: string;
  customerType: CustomerType;
  startAt: string;
  durationMinutes: number;
  paymentStatus: PaymentStatus;
  amountPaid?: number;
  freeGame?: boolean;
  discountAmount?: number;
  notes?: string;
}

const PAYMENT_TO_API: Record<PaymentStatus, ApiBookingPaymentStatus> = {
  paid: 'PAID',
  pending: 'PENDING',
  partial: 'PARTIAL',
};
const CUSTOMER_TYPE_TO_API: Record<CustomerType, ApiCustomerType> = {
  team: 'TEAM',
  individual: 'INDIVIDUAL',
  club: 'CLUB',
};

export function useCreateVenueBooking() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateBookingVars) =>
      gqlRequest(CREATE_VENUE_BOOKING, {
        input: {
          venueId,
          courtId: vars.courtId,
          customerName: vars.customerName,
          customerPhone: vars.customerPhone,
          customerType: CUSTOMER_TYPE_TO_API[vars.customerType],
          startAt: vars.startAt,
          durationMinutes: vars.durationMinutes,
          paymentStatus: PAYMENT_TO_API[vars.paymentStatus],
          amountPaid: vars.amountPaid,
          freeGame: vars.freeGame ?? false,
          discountAmount: vars.discountAmount,
          notes: vars.notes,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['venueBookings', venueId] });
      qc.invalidateQueries({ queryKey: ['venueBookingSummary', venueId] });
    },
  });
}
