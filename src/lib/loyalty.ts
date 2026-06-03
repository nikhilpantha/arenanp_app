/**
 * Loyalty reward: a free game after every `freeAfter` paid games, per customer (by phone),
 * across all sports. TODO(backend): counts come from the customer/bookings API.
 */
export const DEFAULT_FREE_AFTER = 10;

export interface LoyaltyState {
  gamesPlayed: number;
  freeAfter: number;
  /** Games remaining until the next free one (0 when the next game is free). */
  toNextFree: number;
  /** True when this customer's next game is free. */
  isFreeNext: boolean;
}

export function computeLoyalty(gamesPlayed: number, freeAfter = DEFAULT_FREE_AFTER): LoyaltyState {
  const mod = gamesPlayed % freeAfter;
  const isFreeNext = gamesPlayed > 0 && mod === 0;
  return {
    gamesPlayed,
    freeAfter,
    toNextFree: isFreeNext ? 0 : freeAfter - mod,
    isFreeNext,
  };
}
