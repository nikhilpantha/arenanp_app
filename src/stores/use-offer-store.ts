import { create } from 'zustand';

import { OFFER_CLAIMS, OFFERS } from '@/data/offers';
import type { Offer, OfferClaim, OfferSubjectType } from '@/types';

const today = () => new Date().toISOString().slice(0, 10);

interface OfferState {
  offers: Offer[];
  claims: OfferClaim[];
  addOffer: (offer: Offer) => void;
  updateOffer: (id: string, patch: Partial<Offer>) => void;
  toggleOfferStatus: (id: string) => void;
  removeOffer: (id: string) => void;
  /** Grant a manual offer to a customer/team — becomes an available voucher. */
  claimOffer: (offerId: string, subjectType: OfferSubjectType, subjectId: string) => void;
  /** Mark a claim used (called when its booking is confirmed). */
  redeemClaim: (id: string) => void;
}

/**
 * Offers + claims, kept in memory. TODO(backend): hydrate from the promotions API
 * and sync mutations through a seam like {@link import('@/lib/venues').updateVenue}.
 */
export const useOfferStore = create<OfferState>((set) => ({
  offers: OFFERS,
  claims: OFFER_CLAIMS,
  addOffer: (offer) => set((s) => ({ offers: [offer, ...s.offers] })),
  updateOffer: (id, patch) =>
    set((s) => ({ offers: s.offers.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
  toggleOfferStatus: (id) =>
    set((s) => ({
      offers: s.offers.map((o) =>
        o.id === id ? { ...o, status: o.status === 'paused' ? 'active' : 'paused' } : o,
      ),
    })),
  removeOffer: (id) => set((s) => ({ offers: s.offers.filter((o) => o.id !== id) })),
  claimOffer: (offerId, subjectType, subjectId) =>
    set((s) => ({
      claims: [
        { id: `ocl-${Date.now()}`, offerId, subjectType, subjectId, status: 'available', claimedAt: today() },
        ...s.claims,
      ],
    })),
  redeemClaim: (id) =>
    set((s) => ({
      claims: s.claims.map((c) => (c.id === id ? { ...c, status: 'redeemed', redeemedAt: today() } : c)),
    })),
}));
