import { View } from 'react-native';

import { Badge, Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { LoyaltyState } from '@/lib/loyalty';

/**
 * Loyalty standing for the customer detail: a free-game-ready highlight, or progress
 * toward the next free game with a bar. Richer than the compact in-booking hint.
 */
export function CustomerLoyaltyCard({ loyalty }: { loyalty: LoyaltyState }) {
  const theme = useTheme();
  const ready = loyalty.isFreeNext;
  const done = ready ? loyalty.freeAfter : loyalty.freeAfter - loyalty.toNextFree;
  const pct = loyalty.freeAfter > 0 ? Math.min(1, Math.max(0, done / loyalty.freeAfter)) : 0;

  return (
    <Card
      elevation="none"
      className="gap-sm"
      style={{ backgroundColor: ready ? `${theme.primary}14` : theme.cardMuted }}>
      <View className="flex-row items-center gap-sm">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: ready ? theme.primary : `${theme.primary}1A` }}>
          <Icon name="award" size={18} color={ready ? '#ffffff' : theme.primary} />
        </View>
        <Typography variant="label-md" style={{ flex: 1 }}>
          Loyalty
        </Typography>
        {ready ? (
          <Badge variant="success">🎉 Free game ready</Badge>
        ) : (
          <Badge variant="neutral">{`${loyalty.toNextFree} to go`}</Badge>
        )}
      </View>

      {/* Progress toward the next free game. */}
      <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.cardSunken }}>
        <View
          className="h-2 rounded-full"
          style={{ width: `${pct * 100}%`, backgroundColor: theme.primary }}
        />
      </View>

      <Typography variant="body-md" color={theme.inkMuted}>
        {ready
          ? `Earned a free game — apply it on the next booking.`
          : `${done}/${loyalty.freeAfter} games · ${loyalty.toNextFree} more to a free game`}
      </Typography>
    </Card>
  );
}
