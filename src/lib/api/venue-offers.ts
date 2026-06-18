import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { gqlRequest, isApiConfigured } from './client';
import {
  type ApiOffer,
  type ApiOfferAudience,
  type ApiOfferDiscountType,
  type ApiOfferTrigger,
  CREATE_OFFER,
  DELETE_VENUE_OFFER,
  UPDATE_OFFER,
  VENUE_OFFERS,
} from './operations';
import { useActiveVenueId } from './venue-bookings';

/**
 * A venue offer as the management screens use it — a direct view of the backend
 * Offer (promo-code discounts + every-Nth loyalty rewards). Deliberately separate
 * from the richer mock `@/types` `Offer` used by the in-booking offer picker.
 */
export interface VenueOffer {
  id: string;
  title: string;
  description?: string;
  discountType: ApiOfferDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minSubtotal: number;
  trigger: ApiOfferTrigger;
  audience: ApiOfferAudience;
  everyGames?: number;
  code?: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

/** The editable fields of an offer (everything except identity + usage). */
export type VenueOfferDraft = Omit<VenueOffer, 'id' | 'usageCount'>;

function mapApiOffer(o: ApiOffer): VenueOffer {
  return {
    id: o.id,
    title: o.title,
    description: o.description ?? undefined,
    discountType: o.discountType,
    discountValue: o.discountValue,
    maxDiscount: o.maxDiscount ?? undefined,
    minSubtotal: o.minSubtotal,
    trigger: o.trigger,
    audience: o.audience,
    everyGames: o.everyGames ?? undefined,
    code: o.code ?? undefined,
    validFrom: o.validFrom,
    validUntil: o.validUntil,
    isActive: o.isActive,
    usageLimit: o.usageLimit ?? undefined,
    usageCount: o.usageCount,
  };
}

// ── Display helpers ───────────────────────────────────────────────────────────

export function rewardLabel(o: Pick<VenueOffer, 'discountType' | 'discountValue'>): string {
  if (o.discountType === 'FREE_GAME') return 'Free game';
  if (o.discountType === 'PERCENT') return `${o.discountValue}% off`;
  return `Rs ${o.discountValue} off`;
}

export function triggerLabel(o: Pick<VenueOffer, 'trigger' | 'everyGames' | 'code'>): string {
  if (o.trigger === 'EVERY_NTH') return `Every ${o.everyGames ?? 0} games`;
  return o.code ? `Promo code · ${o.code}` : 'Promo code';
}

export const AUDIENCE_LABEL: Record<ApiOfferAudience, string> = {
  ALL: 'Everyone',
  INDIVIDUAL: 'Players',
  TEAM: 'Teams',
};

/** One-line summary for an offer card, e.g. "Every 10 games · Free game". */
export const offerSummary = (o: VenueOffer): string => `${triggerLabel(o)} · ${rewardLabel(o)}`;

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** True when offers should be managed against the live API. */
export function useOffersApiEnabled(): boolean {
  const venueId = useActiveVenueId();
  return isApiConfigured && !!venueId;
}

export function useVenueOffers() {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['venueOffers', venueId],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<VenueOffer[]> => {
      const r = await gqlRequest<{ venueOffers: { items: ApiOffer[] } }>(VENUE_OFFERS, {
        input: { venueId, pagination: { page: 1, pageSize: 100 } },
      });
      return r.venueOffers.items.map(mapApiOffer);
    },
  });
}

/** A single offer (read from the list — no dedicated backend query needed). */
export function useVenueOffer(offerId: string | undefined) {
  const q = useVenueOffers();
  return { ...q, data: q.data?.find((o) => o.id === offerId) };
}

/** Backend create input minus venueId (added by the hook). */
function toInput(draft: VenueOfferDraft) {
  return {
    title: draft.title,
    description: draft.description,
    discountType: draft.discountType,
    discountValue: draft.discountValue,
    maxDiscount: draft.maxDiscount,
    minSubtotal: draft.minSubtotal,
    trigger: draft.trigger,
    audience: draft.audience,
    everyGames: draft.everyGames,
    code: draft.code,
    validFrom: draft.validFrom,
    validUntil: draft.validUntil,
    usageLimit: draft.usageLimit,
  };
}

export function useCreateOffer() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draft: VenueOfferDraft) =>
      gqlRequest(CREATE_OFFER, { input: { venueId, ...toInput(draft) } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venueOffers', venueId] }),
  });
}

/** Patch for an update — any editable field, plus `isActive` for pause/resume. */
export type VenueOfferPatch = Partial<VenueOfferDraft> & { isActive?: boolean };

export function useUpdateOffer() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    // Only the provided keys are sent; undefined ones are dropped by JSON and the
    // backend leaves those columns unchanged.
    mutationFn: (vars: { offerId: string; patch: VenueOfferPatch }) =>
      gqlRequest(UPDATE_OFFER, { input: { venueId, offerId: vars.offerId, ...vars.patch } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venueOffers', venueId] }),
  });
}

export function useDeleteOffer() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) => gqlRequest(DELETE_VENUE_OFFER, { venueId, offerId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venueOffers', venueId] }),
  });
}
