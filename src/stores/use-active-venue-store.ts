import { create } from 'zustand';

interface ActiveVenueState {
  /** The venue the dashboard is scoped to. null = fall back to the first venue. */
  activeVenueId: string | null;
  setActiveVenueId: (venueId: string | null) => void;
}

/**
 * Which of the owner's venues the dashboard is currently viewing. The venue
 * switcher writes here; {@link import('@/lib/api/venue-bookings').useActiveVenueId}
 * resolves it (validated against the live memberships, else the first venue).
 */
export const useActiveVenueStore = create<ActiveVenueState>((set) => ({
  activeVenueId: null,
  setActiveVenueId: (venueId) => set({ activeVenueId: venueId }),
}));
