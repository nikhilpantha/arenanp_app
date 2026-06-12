import { create } from 'zustand';

import type { VenueFormValues } from '@/components/venue/onboarding/form';
import { MOCK_VENUE } from '@/data/venue';
import { updateVenue as persistVenue } from '@/lib/venues';

interface VenueState {
  venue: VenueFormValues;
  /** Backend venue id (null in mock mode). */
  venueId: string | null;
  /** Listing moderation status from the backend (null in mock mode). */
  verificationStatus: string | null;
  /** Replace the venue from the backend (`myVenue`). */
  hydrate: (venue: VenueFormValues, meta: { venueId: string; verificationStatus: string }) => void;
  /** Merge edited fields into the saved venue (and hand them to the backend seam). */
  updateVenue: (patch: Partial<VenueFormValues>) => void;
}

/**
 * The owner's saved venue, kept in memory and edited from the profile screens.
 * Hydrated from the venues API ({@link import('@/lib/api/venue').useMyVenue}) when
 * live; falls back to {@link MOCK_VENUE} offline.
 */
export const useVenueStore = create<VenueState>((set, get) => ({
  venue: MOCK_VENUE,
  venueId: null,
  verificationStatus: null,
  hydrate: (venue, meta) =>
    set({ venue, venueId: meta.venueId, verificationStatus: meta.verificationStatus }),
  updateVenue: (patch) => {
    const venue = { ...get().venue, ...patch };
    set({ venue });
    void persistVenue(venue);
  },
}));
