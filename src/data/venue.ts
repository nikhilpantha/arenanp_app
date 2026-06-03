import type { VenueFormValues } from '@/components/venue/onboarding/form';

/**
 * The owner's saved venue. Frontend-only seed — stands in for the venues API until
 * it lands. Shaped as {@link VenueFormValues} so the onboarding step UIs can edit it
 * directly. TODO(backend): hydrate this from the venues API per the session user.
 */
export const MOCK_VENUE: VenueFormValues = {
  coverPhoto: '',
  photos: [],
  venueName: 'Arena Futsal',
  description: 'Premium futsal & multi-sport venue in the heart of Pulchowk.',
  venuePhone: '9801234567',
  contactPhone: '',
  address: 'Pulchowk, Lalitpur',
  latitude: 27.6786,
  longitude: 85.3169,
  services: [
    { sport: 'futsal', features: ['Indoor', 'Floodlights'], courts: 2, slotMinutes: 60, pricePerSlot: 1200 },
    { sport: 'basketball', features: ['Outdoor'], courts: 1, slotMinutes: 60, pricePerSlot: 900 },
  ],
  additionalServices: [{ name: 'Bib rental', price: 50 }, { name: 'Parking' }],
  openTime: '06:00',
  closeTime: '22:00',
  verification: undefined,
};
