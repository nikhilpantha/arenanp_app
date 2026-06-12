import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toE164 } from '@/components/common';
import type { VenueFormValues } from '@/components/venue/onboarding/form';
import type { SportType } from '@/types';

import { gqlRequest, isApiConfigured } from './client';
import { type ApiVenue,MY_VENUE, UPDATE_VENUE_PROFILE } from './operations';
import { useActiveVenueId } from './venue-bookings';

/** Strip a stored E.164 Nepal number (+9779…) back to the 10-digit local form. */
function toLocalPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/^\+977/, '');
}

/** Map the backend venue → the app's `VenueFormValues` (the venue store shape). */
export function mapApiVenueToForm(v: ApiVenue): VenueFormValues {
  // Rebuild per-sport "services" by grouping the venue's courts.
  const bySport = new Map<string, { count: number; slotMinutes: number; pricePerHour: number; features: string[] }>();
  for (const c of v.courts) {
    const key = c.sport.slug;
    const existing = bySport.get(key);
    if (existing) existing.count += 1;
    else
      bySport.set(key, {
        count: 1,
        slotMinutes: c.slotMinutes,
        pricePerHour: c.pricePerHour,
        features: c.features ?? [],
      });
  }
  const services = [...bySport.entries()].map(([slug, s]) => ({
    sport: slug as SportType,
    features: s.features,
    courts: s.count,
    slotMinutes: s.slotMinutes,
    // Backend stores per-hour; the form works in per-slot.
    pricePerSlot: Math.round((s.pricePerHour * s.slotMinutes) / 60),
  }));

  return {
    coverPhoto: v.coverImageUrl ?? '',
    photos: v.imageUrls ?? [],
    venueName: v.name,
    description: v.description ?? '',
    venuePhone: toLocalPhone(v.contactPhone),
    contactPhone: '',
    address: v.address ?? '',
    latitude: v.latitude ?? 0,
    longitude: v.longitude ?? 0,
    services,
    additionalServices: (v.additionalServices ?? []).map((a) => ({
      name: a.name,
      price: a.price ?? undefined,
    })),
    openTime: v.openTime,
    closeTime: v.closeTime,
    verification: undefined,
  };
}

/** Map `VenueFormValues` → the `updateVenueProfile` input (profile fields only). */
export function mapFormToUpdateInput(venueId: string, v: VenueFormValues) {
  const photos = [v.coverPhoto, ...(v.photos ?? [])].filter((p): p is string => Boolean(p));
  return {
    venueId,
    name: v.venueName,
    description: v.description || undefined,
    address: v.address,
    latitude: v.latitude,
    longitude: v.longitude,
    coverImageUrl: photos[0],
    imageUrls: photos.slice(1),
    openTime: v.openTime,
    closeTime: v.closeTime,
    contactPhone: v.venuePhone ? toE164(v.venuePhone) : undefined,
    additionalServices: (v.additionalServices ?? []).map((a) => ({ name: a.name, price: a.price })),
  };
}

export function useMyVenue() {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['myVenue', venueId],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<ApiVenue> => {
      const r = await gqlRequest<{ myVenue: ApiVenue }>(MY_VENUE, { venueId });
      return r.myVenue;
    },
  });
}

export function useUpdateVenueProfile() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: VenueFormValues) => {
      if (!venueId) throw new Error('No venue to update.');
      return gqlRequest(UPDATE_VENUE_PROFILE, { input: mapFormToUpdateInput(venueId, values) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myVenue', venueId] });
    },
  });
}
