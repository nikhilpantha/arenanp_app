import type { DayOfWeek, Offer, OfferClaim, OfferSubjectType, SportType } from '@/types';

import { computeLoyalty } from './loyalty';

const DAY_LABEL: Record<DayOfWeek, string> = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
};
const WEEKDAYS: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
const ORDER: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function hourLabel(h: number): string {
  const period = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${period}`;
}

function daysLabel(days?: DayOfWeek[]): string {
  if (!days || days.length === 0 || days.length === 7) return 'Every day';
  const set = new Set(days);
  if (days.length === 6 && !set.has('sat')) return 'Weekdays';
  if (days.length === 2 && set.has('sat') && set.has('sun')) return 'Weekends';
  return ORDER.filter((d) => set.has(d)).map((d) => DAY_LABEL[d]).join(', ');
}

export const isManualOffer = (offer: Offer): boolean => offer.trigger === 'manual';

/** Short reward phrase, e.g. "Free game", "20% off", "Rs 200 off". */
export function rewardLabel(offer: Offer): string {
  if (offer.reward === 'free-game') return 'Free game';
  if (offer.reward === 'percent') return `${offer.rewardValue ?? 0}% off`;
  return `Rs ${offer.rewardValue ?? 0} off`;
}

/** Short trigger phrase, e.g. "Every 10 games", "Weekdays · 6 AM–10 AM". */
export function triggerLabel(offer: Offer): string {
  switch (offer.trigger) {
    case 'every-nth':
      return `Every ${offer.everyGames ?? 0} games`;
    case 'happy-hour':
      return `${daysLabel(offer.days)} · ${hourLabel(offer.startHour ?? 0)}–${hourLabel(offer.endHour ?? 0)}`;
    case 'manual':
      return 'Granted by you';
  }
}

/** One-line summary used on cards, e.g. "Every 10 games · Free game". */
export const offerSummary = (offer: Offer): string => `${triggerLabel(offer)} · ${rewardLabel(offer)}`;

export interface EveryNthProgress {
  games: number;
  every: number;
  toNext: number;
  ready: boolean;
}

/** Loyalty/milestone progress for an `every-nth` offer (null otherwise). */
export function everyNthProgress(offer: Offer, games: number): EveryNthProgress | null {
  if (offer.trigger !== 'every-nth' || !offer.everyGames) return null;
  const l = computeLoyalty(games, offer.everyGames);
  return { games, every: offer.everyGames, toNext: l.toNextFree, ready: l.isFreeNext };
}

export interface OfferEffect {
  discountAmt: number;
  isFree: boolean;
  total: number;
}

/** Applies an offer's reward to a base price. */
export function applyOffer(offer: Offer | null, base: number): OfferEffect {
  if (!offer) return { discountAmt: 0, isFree: false, total: base };
  if (offer.reward === 'free-game') return { discountAmt: base, isFree: true, total: 0 };
  const raw = offer.rewardValue ?? 0;
  const discountAmt = Math.min(base, offer.reward === 'percent' ? Math.round((base * raw) / 100) : raw);
  return { discountAmt, isFree: false, total: Math.max(0, base - discountAmt) };
}

export interface OfferContext {
  subjectType: OfferSubjectType;
  games: number;
  sport?: SportType;
  /** Day-of-week + hour of the booking — lets happy-hour offers resolve as ready. */
  day?: DayOfWeek;
  hour?: number;
}

export interface SubjectOfferEntry {
  offer: Offer;
  /** True when the offer can be applied to a booking right now. */
  ready: boolean;
  progress?: EveryNthProgress; // every-nth
  claim?: OfferClaim; // manual: the customer/team's claim, if any
}

function matchesAudience(offer: Offer, subjectType: OfferSubjectType): boolean {
  if (offer.audience === 'all') return true;
  if (subjectType === 'team') return offer.audience === 'team';
  return offer.audience === 'individual' || offer.audience === 'member';
}

function matchesSport(offer: Offer, sport?: SportType): boolean {
  if (!offer.sports || offer.sports.length === 0) return true;
  return !sport || offer.sports.includes(sport);
}

/**
 * All active offers that apply to a subject (customer/team), with their readiness,
 * progress and any existing claim. Drives both the claim UI and the booking selector.
 */
export function offersForSubject(
  ctx: OfferContext,
  offers: Offer[],
  claims: OfferClaim[],
  subjectId: string,
): SubjectOfferEntry[] {
  return offers
    .filter((o) => o.status === 'active' && matchesAudience(o, ctx.subjectType) && matchesSport(o, ctx.sport))
    .map((offer) => {
      if (offer.trigger === 'every-nth') {
        const progress = everyNthProgress(offer, ctx.games) ?? undefined;
        return { offer, ready: progress?.ready ?? false, progress };
      }
      if (offer.trigger === 'happy-hour') {
        const inWindow =
          ctx.day != null &&
          ctx.hour != null &&
          (offer.days ?? WEEKDAYS).includes(ctx.day) &&
          ctx.hour >= (offer.startHour ?? 0) &&
          ctx.hour < (offer.endHour ?? 24);
        return { offer, ready: inWindow };
      }
      // manual — ready only when the subject holds an available claim.
      const claim = claims.find(
        (c) => c.offerId === offer.id && c.subjectId === subjectId && c.status === 'available',
      );
      return { offer, ready: Boolean(claim), claim };
    });
}
