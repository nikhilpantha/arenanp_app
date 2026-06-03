import type { VenueFormValues } from '@/components/venue/onboarding/form';
import type { VenueDraft } from '@/types';

/**
 * Single integration point for persisting a venue. Intentionally a no-op for now —
 * the backend team will wire this to their API. The onboarding flow collects the
 * {@link VenueDraft}; once a backend exists, submit it here (using the session's user id).
 *
 * TODO(backend): POST the draft to the venues API and handle the response/errors.
 */
export async function submitVenueDraft(draft: VenueDraft): Promise<void> {
  if (__DEV__) {
    console.log('[venue-onboarding] collected draft (not persisted yet):', draft);
  }
}

/**
 * Persist edits made to an existing venue from the profile screens. No-op for now.
 * TODO(backend): PATCH the venue on the venues API.
 */
export async function updateVenue(values: VenueFormValues): Promise<void> {
  if (__DEV__) {
    console.log('[venue-edit] updated venue (not persisted yet):', values);
  }
}
