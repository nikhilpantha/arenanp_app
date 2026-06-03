/**
 * Editable sections of the venue profile. Each maps 1:1 to an onboarding step so the
 * same step UIs can edit a saved venue. `stepIndex` selects which fields to validate
 * on save (see STEP_FIELDS in components/venue/onboarding/form.ts).
 */
export type VenueEditSection = 'basics' | 'location' | 'services' | 'hours' | 'verification';

export interface VenueEditMeta {
  title: string;
  subtitle: string;
  stepIndex: number;
  /** Match the onboarding step's scroll behaviour (location uses a full-height map). */
  scroll: boolean;
}

export const VENUE_EDIT_META: Record<VenueEditSection, VenueEditMeta> = {
  basics: { title: 'Photos & basics', subtitle: 'Name, description and contact details.', stepIndex: 0, scroll: true },
  location: { title: 'Location', subtitle: 'Search or drop a pin so players find you.', stepIndex: 1, scroll: false },
  services: { title: 'Sports & pricing', subtitle: 'What you offer, courts, slots and price.', stepIndex: 2, scroll: true },
  hours: { title: 'Operating hours', subtitle: 'When players can book.', stepIndex: 3, scroll: true },
  verification: { title: 'Verification', subtitle: 'Earn a Verified badge.', stepIndex: 4, scroll: true },
};
