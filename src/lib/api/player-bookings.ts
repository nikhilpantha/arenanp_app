import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { SportType } from '@/types';

import { gqlRequest, isApiConfigured } from './client';
import {
  type ApiBookingPaymentStatus,
  type ApiBookingStatus,
  type ApiOfferDiscountType,
  type ApiPageInfo,
  type ApiPlayerBooking,
  type ApiPlayerOffer,
  AVAILABLE_OFFERS,
  CANCEL_MY_BOOKING,
  CREATE_BOOKING,
  MY_BOOKINGS,
} from './operations';

/** A player's own booking (player-panel view). Keeps the raw backend status. */
export interface PlayerBooking {
  id: string;
  venueId: string;
  venueName: string;
  venueCity?: string;
  venueAddress?: string;
  courtId: string;
  courtName: string;
  sport: { slug: SportType; name: string };
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: ApiBookingStatus;
  total: number;
  paymentStatus: ApiBookingPaymentStatus;
  createdAt: string;
}

export function mapPlayerBooking(b: ApiPlayerBooking): PlayerBooking {
  return {
    id: b.id,
    venueId: b.venue.id,
    venueName: b.venue.name,
    venueCity: b.venue.city ?? undefined,
    venueAddress: b.venue.address ?? undefined,
    courtId: b.courtId,
    courtName: b.courtName,
    sport: { slug: b.sport.slug as SportType, name: b.sport.name },
    startAt: b.startAt,
    endAt: b.endAt,
    durationMinutes: b.durationMinutes,
    status: b.status,
    total: b.total,
    paymentStatus: b.paymentStatus,
    createdAt: b.createdAt,
  };
}

const MY_BOOKINGS_PAGE_SIZE = 20;

interface ApiMyBookingsPage {
  myBookings: { items: ApiPlayerBooking[]; pageInfo: ApiPageInfo };
}

/** The signed-in player's bookings, paged for infinite scroll (most recent first). */
export function useMyBookings() {
  return useInfiniteQuery({
    queryKey: ['myBookings'],
    enabled: isApiConfigured,
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const r = await gqlRequest<ApiMyBookingsPage>(MY_BOOKINGS, {
        input: { pagination: { page: pageParam, pageSize: MY_BOOKINGS_PAGE_SIZE } },
      });
      return { items: r.myBookings.items.map(mapPlayerBooking), pageInfo: r.myBookings.pageInfo };
    },
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? last.pageInfo.page + 1 : undefined),
  });
}

export interface CreatePlayerBookingVars {
  courtId: string;
  startAt: string;
  durationMinutes: number;
  offerCode?: string;
  notes?: string;
}

/** Request a court booking. Starts PENDING_PAYMENT until the venue confirms. */
export function useCreatePlayerBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreatePlayerBookingVars) =>
      gqlRequest<{ createBooking: ApiPlayerBooking }>(CREATE_BOOKING, {
        input: {
          courtId: vars.courtId,
          startAt: vars.startAt,
          durationMinutes: vars.durationMinutes,
          offerCode: vars.offerCode || undefined,
          notes: vars.notes || undefined,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myBookings'] }),
  });
}

/** Cancel one of the player's own bookings (only before a terminal state). */
export function useCancelMyBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { bookingId: string; reason?: string }) =>
      gqlRequest(CANCEL_MY_BOOKING, {
        input: { bookingId: vars.bookingId, reason: vars.reason || undefined },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myBookings'] }),
  });
}

/** A venue offer a player can apply to a booking by code. */
export interface PlayerOffer {
  id: string;
  title: string;
  description?: string;
  code?: string;
  discountType: ApiOfferDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minSubtotal: number;
}

function mapOffer(o: ApiPlayerOffer): PlayerOffer {
  return {
    id: o.id,
    title: o.title,
    description: o.description ?? undefined,
    code: o.code ?? undefined,
    discountType: o.discountType,
    discountValue: o.discountValue,
    maxDiscount: o.maxDiscount ?? undefined,
    minSubtotal: o.minSubtotal,
  };
}

/** Currently-redeemable offers for a venue (only those a player can apply by code). */
export function useAvailableOffers(venueId: string | undefined) {
  return useQuery({
    queryKey: ['availableOffers', venueId],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<PlayerOffer[]> => {
      const r = await gqlRequest<{ availableOffers: ApiPlayerOffer[] }>(AVAILABLE_OFFERS, { venueId });
      // Only code-based PERCENT/FLAT offers can be applied via `offerCode`.
      return r.availableOffers
        .filter((o) => !!o.code && (o.discountType === 'PERCENT' || o.discountType === 'FLAT'))
        .map(mapOffer);
    },
  });
}

/** Client-side preview of an offer's discount on a subtotal (mirrors the server rule). */
export function offerDiscount(offer: PlayerOffer, subtotal: number): number {
  if (subtotal < offer.minSubtotal) return 0;
  if (offer.discountType === 'PERCENT') {
    const raw = (offer.discountValue / 100) * subtotal;
    const capped = offer.maxDiscount != null ? Math.min(raw, offer.maxDiscount) : raw;
    return Math.min(Math.round(capped), subtotal);
  }
  return Math.min(offer.discountValue, subtotal); // FLAT
}
