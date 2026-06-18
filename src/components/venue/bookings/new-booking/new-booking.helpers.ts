import type { ApiLoyaltyStatus } from '@/lib/api/operations';
import type { LoyaltyState } from '@/lib/loyalty';
import { applyOffer, type SubjectOfferEntry } from '@/lib/offers';
import type { PaymentStatus } from '@/types';

/**
 * Pricing for a booking. The discount comes only from an applied offer (or a loyalty
 * free game) — there is no manual discount.
 */
export function computePricing(
  unitPrice: number,
  duration: number,
  offer: SubjectOfferEntry | null,
  redeemLoyalty: boolean,
) {
  const base = unitPrice * duration;
  const effect = applyOffer(offer?.offer ?? null, base);
  const isFree = effect.isFree || redeemLoyalty;
  const discountAmt = isFree ? base : offer ? effect.discountAmt : 0;
  const discountReason = redeemLoyalty ? 'Loyalty free game' : offer?.offer.title;
  const total = isFree ? 0 : Math.max(0, base - discountAmt);
  return { base, effect, isFree, discountAmt, discountReason, total, totalLabel: isFree ? 'Free' : `Rs ${total}` };
}

/** Human label for the booking's payment state, shown in the review modal. */
export function paymentLabel(
  isFree: boolean,
  status: PaymentStatus,
  total: number,
  paid: number,
  remaining: number,
): string {
  if (isFree) return 'Free game';
  if (status === 'paid') return `Paid · Rs ${total}`;
  if (status === 'partial') return `Partial · Rs ${paid} paid, Rs ${remaining} due`;
  return `Pending · Rs ${total} due`;
}

/** Map the backend loyalty status to the app's LoyaltyState (null when not configured). */
export function toLoyaltyState(api: ApiLoyaltyStatus | undefined): LoyaltyState | null {
  if (!api?.configured) return null;
  return {
    gamesPlayed: api.gamesPlayed,
    freeAfter: api.every ?? 10,
    toNextFree: api.toNext,
    isFreeNext: api.ready,
  };
}
