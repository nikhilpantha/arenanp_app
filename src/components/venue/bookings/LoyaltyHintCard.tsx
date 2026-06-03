import { Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { LoyaltyState } from '@/lib/loyalty';

/**
 * Loyalty status line for the new-booking flow. The free game is tracked per loyalty
 * subject — an individual (by phone) or a team (by its total games) — and applied when
 * the next game is free. `isNew` covers a valid-but-unseen phone (loyalty starts now).
 */
export function LoyaltyHintCard({
  name,
  loyalty,
  isNew = false,
}: {
  name?: string;
  loyalty: LoyaltyState | null;
  isNew?: boolean;
}) {
  const theme = useTheme();
  if (!loyalty && !isNew) return null;

  const free = loyalty?.isFreeNext ?? false;
  const first = name?.split(' ')[0] ?? '';
  const message = free
    ? `🎉 Free game! ${first} earned a reward.`
    : loyalty
      ? `${loyalty.gamesPlayed}/${loyalty.freeAfter} games · ${loyalty.toNextFree} to a free game`
      : 'New customer · loyalty starts with this game';

  return (
    <Card
      elevation="none"
      style={{ backgroundColor: free ? `${theme.primary}14` : theme.cardMuted }}
      className="flex-row items-center gap-sm">
      <Icon name={free ? 'award' : 'activity'} size={20} color={theme.primary} />
      <Typography variant="label-md" color={theme.ink} style={{ flex: 1, textTransform: 'none' }}>
        {message}
      </Typography>
    </Card>
  );
}
