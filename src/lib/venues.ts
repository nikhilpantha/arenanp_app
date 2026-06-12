import type { VenueFormValues } from '@/components/venue/onboarding/form';
import type { VenueDraft } from '@/types';

import { gqlRequest } from './api/client';
import { SUBMIT_VENUE } from './api/operations';
import { uploadLocalFile, uploadLocalFiles } from './api/uploads';

/**
 * Map an onboarding {@link VenueDraft} to the backend `SubmitVenueInput`, uploading
 * any device-local photos + KYC docs to S3 first and replacing them with the
 * returned object keys. First photo is the cover, the rest the gallery.
 */
async function toSubmitVenueInput(draft: VenueDraft) {
  const [coverUri, ...galleryUris] = draft.photos;
  const verification = draft.verification;

  // Uploads run in parallel; non-local values (already keys) pass through untouched.
  const [coverImageUrl, imageUrls, documentUrls] = await Promise.all([
    coverUri ? uploadLocalFile(coverUri, { category: 'VENUE_COVER' }) : Promise.resolve(undefined),
    uploadLocalFiles(galleryUris, { category: 'VENUE_IMAGE' }),
    verification
      ? uploadLocalFiles(
          [verification.panDoc, verification.businessRegDoc, verification.citizenshipDoc].filter(
            (u): u is string => Boolean(u),
          ),
          { category: 'VENUE_DOCUMENT' },
        )
      : Promise.resolve([] as string[]),
  ]);

  return {
    name: draft.venueName,
    description: draft.description,
    address: draft.address,
    latitude: draft.latitude,
    longitude: draft.longitude,
    coverImageUrl,
    imageUrls,
    openTime: draft.openTime,
    closeTime: draft.closeTime,
    contactPhone: draft.contactPhone ?? draft.venuePhone,
    services: draft.services.map((s) => ({
      sportSlug: s.sport,
      courtCount: s.courts,
      slotMinutes: s.slotMinutes,
      // Backend stores a per-hour rate; convert the per-slot price (== per-hour for 60-min slots).
      pricePerHour: Math.round((s.pricePerSlot * 60) / s.slotMinutes),
      features: s.features,
    })),
    additionalServices: draft.additionalServices.map((a) => ({ name: a.name, price: a.price })),
    verification: verification
      ? { panNumber: verification.panNumber, documentUrls }
      : undefined,
  };
}

/**
 * Add a full venue from the dashboard via the backend `submitVenue` mutation
 * (creates an auto-approved venue + an OWNER membership + ensures the VENUE
 * capability). The VENUE capability itself is granted at signup (per-role OTP).
 * Photos + KYC docs are uploaded to S3 in
 * {@link toSubmitVenueInput} and submitted as object keys.
 */
export async function submitVenueDraft(draft: VenueDraft): Promise<string> {
  const r = await gqlRequest<{ submitVenue: { id: string } }>(SUBMIT_VENUE, {
    input: await toSubmitVenueInput(draft),
  });
  return r.submitVenue.id;
}

/**
 * Persist edits to an existing venue from the profile screens. Still a stub —
 * wiring needs the venue's real id (from `myVenues`) + `updateVenueProfile`.
 * TODO(backend): call updateVenueProfile({ venueId, ...patch }).
 */
export async function updateVenue(values: VenueFormValues): Promise<void> {
  if (__DEV__) {
    console.log('[venue-edit] updated venue (not persisted yet):', values);
  }
}
