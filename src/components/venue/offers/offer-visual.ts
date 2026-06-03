import type { IconName } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { Offer, OfferRewardKind } from '@/types';

const ICON: Record<OfferRewardKind, IconName> = {
  'free-game': 'award',
  percent: 'percent',
  flat: 'dollarSign',
};
const EMOJI: Record<OfferRewardKind, string> = {
  'free-game': '🎁',
  percent: '🏷️',
  flat: '💸',
};

export interface OfferVisual {
  icon: IconName;
  emoji: string;
  accent: string;
}

/** Icon + emoji + accent colour for an offer, keyed off its reward type. */
export function useOfferVisual(offer: Offer): OfferVisual {
  const theme = useTheme();
  const accent =
    offer.reward === 'free-game' ? theme.primary : offer.reward === 'percent' ? theme.secondaryDark : theme.primaryDark;
  return { icon: ICON[offer.reward], emoji: EMOJI[offer.reward], accent };
}
