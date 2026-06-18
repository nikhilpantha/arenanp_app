import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { PAGE_SIZE } from '@/constants/pagination';
import type { VenueBooking } from '@/types';

import { gqlRequest, isApiConfigured } from './client';
import {
  type ApiBooking,
  type ApiLoyaltyStatus,
  type ApiVenueCustomer,
  CREATE_VENUE_CUSTOMER,
  VENUE_CUSTOMER,
  VENUE_CUSTOMER_BOOKINGS,
  VENUE_CUSTOMERS,
  VENUE_LOYALTY_STATUS,
} from './operations';
import { mapApiBooking, useActiveVenueId } from './venue-bookings';

/**
 * A venue's customer — a person or a team, one unified record. Persisted in the
 * Customer table and keyed by id; loyalty is tracked per customer.
 */
export interface VenueCustomer {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  gamesPlayed: number;
  freeGameReady: boolean;
}

function mapApiCustomer(c: ApiVenueCustomer): VenueCustomer {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? undefined,
    notes: c.notes ?? undefined,
    gamesPlayed: c.gamesPlayed,
    freeGameReady: c.freeGameReady,
  };
}

export function useCustomersApiEnabled(): boolean {
  const venueId = useActiveVenueId();
  return isApiConfigured && !!venueId;
}

/**
 * The venue's customers, searchable by name/phone, paged for infinite scroll
 * ({@link PAGE_SIZE} per page). Keeps prior results while typing. A page that
 * returns fewer than {@link PAGE_SIZE} rows is the last one.
 */
export function useVenueCustomers(search: string) {
  const venueId = useActiveVenueId();
  return useInfiniteQuery({
    queryKey: ['venueCustomers', venueId, search],
    enabled: isApiConfigured && !!venueId,
    placeholderData: keepPreviousData,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<VenueCustomer[]> => {
      const r = await gqlRequest<{ venueCustomers: ApiVenueCustomer[] }>(VENUE_CUSTOMERS, {
        input: { venueId, search: search.trim() || undefined, limit: PAGE_SIZE, offset: pageParam },
      });
      return r.venueCustomers.map(mapApiCustomer);
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
    select: (data) => data.pages.flat(),
  });
}

/** A single customer by id. */
export function useVenueCustomer(customerId: string | undefined) {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['venueCustomer', venueId, customerId],
    enabled: isApiConfigured && !!venueId && !!customerId,
    queryFn: async (): Promise<VenueCustomer> => {
      const r = await gqlRequest<{ venueCustomer: ApiVenueCustomer }>(VENUE_CUSTOMER, {
        venueId,
        customerId,
      });
      return mapApiCustomer(r.venueCustomer);
    },
  });
}

/** A customer's bookings (most recent first) for the detail history. */
export function useVenueCustomerBookings(customerId: string | undefined) {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['venueCustomerBookings', venueId, customerId],
    enabled: isApiConfigured && !!venueId && !!customerId,
    queryFn: async (): Promise<VenueBooking[]> => {
      const r = await gqlRequest<{ venueCustomerBookings: ApiBooking[] }>(VENUE_CUSTOMER_BOOKINGS, {
        venueId,
        customerId,
      });
      return r.venueCustomerBookings.map(mapApiBooking);
    },
  });
}

/** Create (or reuse, by phone) a customer; returns it so the caller can select it. */
export function useCreateVenueCustomer() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { name: string; phone?: string }): Promise<VenueCustomer> => {
      const r = await gqlRequest<{ createVenueCustomer: ApiVenueCustomer }>(CREATE_VENUE_CUSTOMER, {
        input: { venueId, name: vars.name, phone: vars.phone || undefined },
      });
      return mapApiCustomer(r.createVenueCustomer);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venueCustomers', venueId] }),
  });
}

export interface SubjectLoyalty {
  configured: boolean;
  every: number | null;
  gamesPlayed: number;
  toNext: number;
  ready: boolean;
  offerId: string | null;
}

/**
 * A subject's loyalty progress toward a free game. Pass a customerId (venue customer),
 * a userId (registered player) or a phone. Enabled only when the API is configured
 * and a subject is set.
 */
export function useSubjectLoyalty(subject: { customerId?: string; userId?: string; phone?: string }) {
  const venueId = useActiveVenueId();
  const { customerId, userId, phone } = subject;
  const hasSubject = Boolean(customerId || userId || (phone && phone.length === 10));
  return useQuery({
    queryKey: ['subjectLoyalty', venueId, customerId ?? userId ?? phone ?? null],
    enabled: isApiConfigured && !!venueId && hasSubject,
    queryFn: async (): Promise<SubjectLoyalty> => {
      const r = await gqlRequest<{ venueLoyaltyStatus: ApiLoyaltyStatus }>(VENUE_LOYALTY_STATUS, {
        input: { venueId, customerId, userId, phone },
      });
      return r.venueLoyaltyStatus;
    },
  });
}
