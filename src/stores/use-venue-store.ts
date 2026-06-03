import { create } from 'zustand';

import type { VenueFormValues } from '@/components/venue/onboarding/form';
import { MOCK_VENUE } from '@/data/venue';
import { updateVenue as persistVenue } from '@/lib/venues';

interface VenueState {
  venue: VenueFormValues;
  /** Merge edited fields into the saved venue (and hand them to the backend seam). */
  updateVenue: (patch: Partial<VenueFormValues>) => void;
}

/**
 * The owner's saved venue, kept in memory and edited from the profile screens.
 * TODO(backend): hydrate from the venues API and let {@link persistVenue} sync changes.
 */
export const useVenueStore = create<VenueState>((set, get) => ({
  venue: MOCK_VENUE,
  updateVenue: (patch) => {
    const venue = { ...get().venue, ...patch };
    set({ venue });
    void persistVenue(venue);
  },
}));
