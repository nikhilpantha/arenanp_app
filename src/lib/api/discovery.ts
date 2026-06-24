import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { pad, to12h } from '@/lib/time';
import type { SportType } from '@/types';

import { gqlRequest, isApiConfigured } from './client';
import {
  type ApiCourtSlots,
  type ApiPageInfo,
  type ApiVenueCard,
  type ApiVenueDetail,
  BROWSE_VENUES,
  COURT_SLOTS,
  VENUE_DETAIL,
} from './operations';

/** A venue as the player marketplace list renders it. */
export interface VenueCardData {
  id: string;
  name: string;
  city?: string;
  address?: string;
  coverImageUrl?: string;
  sports: { slug: string; name: string; iconUrl?: string }[];
  priceFrom?: number;
  openTime: string;
  closeTime: string;
}

export interface BrowseVenuesFilters {
  search?: string;
  /** A sport slug, or 'all' / undefined for no sport filter. */
  sportSlug?: SportType | 'all';
}

function mapVenueCard(v: ApiVenueCard): VenueCardData {
  return {
    id: v.id,
    name: v.name,
    city: v.city ?? undefined,
    address: v.address ?? undefined,
    coverImageUrl: v.coverImageUrl ?? undefined,
    sports: v.sports.map((s) => ({ slug: s.slug, name: s.name, iconUrl: s.iconUrl ?? undefined })),
    priceFrom: v.priceFrom ?? undefined,
    openTime: v.openTime,
    closeTime: v.closeTime,
  };
}

const VENUES_PAGE_SIZE = 12;

interface ApiVenuesPage {
  venues: { items: ApiVenueCard[]; pageInfo: ApiPageInfo };
}

/**
 * The public venue marketplace, paged for infinite scroll. Filters by free-text name
 * search and/or a sport slug. The query is public — no venue/auth gating beyond a
 * configured API.
 */
export function useBrowseVenues(filters: BrowseVenuesFilters) {
  const term = filters.search?.trim() || undefined;
  const sportSlug = filters.sportSlug && filters.sportSlug !== 'all' ? filters.sportSlug : undefined;
  return useInfiniteQuery({
    queryKey: ['browseVenues', term ?? '', sportSlug ?? 'all'],
    enabled: isApiConfigured,
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const r = await gqlRequest<ApiVenuesPage>(BROWSE_VENUES, {
        input: {
          pagination: { page: pageParam, pageSize: VENUES_PAGE_SIZE },
          search: term,
          sportSlug,
        },
      });
      return { items: r.venues.items.map(mapVenueCard), pageInfo: r.venues.pageInfo };
    },
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? last.pageInfo.page + 1 : undefined),
  });
}

/** A bookable court on the venue detail screen. */
export interface PublicCourtData {
  id: string;
  name: string;
  sport: { slug: string; name: string };
  pricePerHour: number;
  slotMinutes: number;
  features: string[];
}

/** Full venue detail for the marketplace detail screen. */
export interface VenueDetailData {
  id: string;
  name: string;
  description?: string;
  city?: string;
  address?: string;
  contactPhone?: string;
  /** Cover first, then the gallery images — all presigned, deduped. */
  images: string[];
  amenities: string[];
  additionalServices: { name: string; price?: number }[];
  sports: { slug: string; name: string }[];
  courts: PublicCourtData[];
  openTime: string;
  closeTime: string;
  latitude?: number;
  longitude?: number;
  /** Lowest active court price/hour (for the Book now CTA). */
  priceFrom?: number;
}

function mapVenueDetail(v: ApiVenueDetail): VenueDetailData {
  const images = [...new Set([v.coverImageUrl, ...v.imageUrls].filter((u): u is string => !!u))];
  const prices = v.courts.map((c) => c.pricePerHour).filter((p) => p > 0);
  return {
    id: v.id,
    name: v.name,
    description: v.description ?? undefined,
    city: v.city ?? undefined,
    address: v.address ?? undefined,
    contactPhone: v.contactPhone ?? undefined,
    images,
    amenities: v.amenities,
    additionalServices: v.additionalServices.map((s) => ({
      name: s.name,
      price: s.price ?? undefined,
    })),
    sports: v.sports.map((s) => ({ slug: s.slug, name: s.name })),
    courts: v.courts.map((c) => ({
      id: c.id,
      name: c.name,
      sport: { slug: c.sport.slug, name: c.sport.name },
      pricePerHour: c.pricePerHour,
      slotMinutes: c.slotMinutes,
      features: c.features,
    })),
    openTime: v.openTime,
    closeTime: v.closeTime,
    latitude: v.latitude ?? undefined,
    longitude: v.longitude ?? undefined,
    priceFrom: prices.length ? Math.min(...prices) : undefined,
  };
}

/** A bookable slot for the player booking flow. */
export interface CourtSlotData {
  /** Absolute ISO start — passed straight to createBooking. */
  startAt: string;
  /** 24h local start, e.g. "18:00" (the grid selection value). */
  value: string;
  /** Display label, e.g. "6:00 PM". */
  label: string;
  available: boolean;
  price: number;
}

export interface CourtSlotsResult {
  slotMinutes: number;
  slots: CourtSlotData[];
}

/** Bookable slots for a court on a venue-local day (public). */
export function useCourtSlots(courtId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['courtSlots', courtId, date],
    enabled: isApiConfigured && !!courtId && !!date,
    queryFn: async (): Promise<CourtSlotsResult> => {
      const r = await gqlRequest<{ courtSlots: ApiCourtSlots }>(COURT_SLOTS, {
        input: { courtId, date },
      });
      return {
        slotMinutes: r.courtSlots.slotMinutes,
        slots: r.courtSlots.slots.map((s) => {
          const d = new Date(s.startAt);
          const value = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
          return { startAt: s.startAt, value, label: to12h(value), available: s.available, price: s.price };
        }),
      };
    },
  });
}

/** Public venue detail with courts + presigned images. */
export function useVenueDetail(venueId: string | undefined) {
  return useQuery({
    queryKey: ['venueDetail', venueId],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<VenueDetailData> => {
      const r = await gqlRequest<{ venue: ApiVenueDetail }>(VENUE_DETAIL, { venueId });
      return mapVenueDetail(r.venue);
    },
  });
}
