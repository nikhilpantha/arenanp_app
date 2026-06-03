import { toE164 } from '@/components/common';
import { yup } from '@/lib/forms';
import type { SportType, VenueDraft } from '@/types';

// Coerce an empty/blank numeric text field to `undefined` so "required"/"min" fire
// with a friendly message instead of a NaN type error.
const numberFromInput = (_value: unknown, original: unknown) =>
  original === '' || original == null ? undefined : Number(original);

const serviceSchema = yup.object({
  sport: yup.mixed<SportType>().required(),
  features: yup.array().of(yup.string().required()).default([]),
  courts: yup.number().min(1).default(1).required(),
  slotMinutes: yup.number().min(15).default(60).required(),
  // Optional-typed so the input can be empty while editing; the test enforces a value.
  pricePerSlot: yup
    .number()
    .transform(numberFromInput)
    .typeError('Enter a price')
    .optional()
    .test('price', 'Enter a price', (v) => typeof v === 'number' && v >= 1),
});

const additionalServiceSchema = yup.object({
  name: yup.string().required('Name is required'),
  price: yup.number().transform(numberFromInput).min(0, 'Invalid price').optional(),
});

export const venueSchema = yup.object({
  // Primary photo shown on cards/listings. Kept separate from the gallery so the UI
  // can ask for it explicitly; recombined (cover first) in toVenueDraft.
  coverPhoto: yup.string().optional(),
  // Additional gallery photos (beyond the cover).
  photos: yup.array().of(yup.string().required()).default([]),
  venueName: yup.string().required('Venue name is required').min(2, 'Too short'),
  description: yup.string().optional(),
  venuePhone: yup
    .string()
    .required('Venue contact is required')
    .length(10, 'Enter a 10-digit number'),
  contactPhone: yup
    .string()
    .optional()
    .test('len', 'Enter a 10-digit number', (v) => !v || v.length === 10),
  address: yup.string().required('Pick your venue location'),
  latitude: yup.number().required('Pick your venue location'),
  longitude: yup.number().required('Pick your venue location'),
  services: yup.array().of(serviceSchema).min(1, 'Add at least one sport').required(),
  additionalServices: yup.array().of(additionalServiceSchema).default([]),
  openTime: yup.string().required().default('06:00'),
  closeTime: yup.string().required().default('22:00'),
  verification: yup
    .object({
      panNumber: yup.string().optional(),
      panDoc: yup.string().optional(),
      businessRegDoc: yup.string().optional(),
      citizenshipDoc: yup.string().optional(),
    })
    .optional()
    .default(undefined),
});

export type VenueFormValues = yup.InferType<typeof venueSchema>;

/** Field names validated before advancing past each step (index = step). */
export const STEP_FIELDS: (keyof VenueFormValues)[][] = [
  ['coverPhoto', 'photos', 'venueName', 'description', 'venuePhone', 'contactPhone'], // basics
  ['address', 'latitude', 'longitude'], // location
  ['services'], // services & pricing
  ['openTime', 'closeTime'], // hours
  [], // verification — all optional
];

/** Empty defaults for a brand-new venue draft. */
export const VENUE_FORM_DEFAULTS: Partial<VenueFormValues> = {
  coverPhoto: '',
  photos: [],
  venueName: '',
  description: '',
  venuePhone: '',
  contactPhone: '',
  services: [],
  additionalServices: [],
  openTime: '06:00',
  closeTime: '22:00',
};

/** True once the owner has supplied any verification document/number. */
export function isVerified(v: VenueFormValues['verification']): boolean {
  return Boolean(v && (v.panDoc || v.panNumber || v.businessRegDoc || v.citizenshipDoc));
}

/** Converts validated form values into the persisted venue draft (phones → E.164). */
export function toVenueDraft(v: VenueFormValues): VenueDraft {
  return {
    // Cover first, then the gallery — drops any empty entries.
    photos: [v.coverPhoto, ...(v.photos ?? [])].filter((p): p is string => Boolean(p)),
    venueName: v.venueName,
    description: v.description || undefined,
    venuePhone: toE164(v.venuePhone),
    contactPhone: v.contactPhone ? toE164(v.contactPhone) : undefined,
    address: v.address,
    latitude: v.latitude,
    longitude: v.longitude,
    services: (v.services ?? []).map((s) => ({
      sport: s.sport,
      features: s.features ?? [],
      courts: s.courts,
      slotMinutes: s.slotMinutes,
      // Guaranteed present post-validation; coerce for the stricter draft type.
      pricePerSlot: s.pricePerSlot ?? 0,
    })),
    additionalServices: (v.additionalServices ?? []).map((a) => ({ name: a.name, price: a.price })),
    openTime: v.openTime,
    closeTime: v.closeTime,
    verification: v.verification,
    verified: isVerified(v.verification),
  };
}
