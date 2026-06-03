import { View } from 'react-native';

import { Card, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { computeLoyalty } from '@/lib/loyalty';

/** Loyalty cycle progress bar — games this cycle and how many to the next free game. */
export function LoyaltyProgress({ gamesPlayed }: { gamesPlayed: number }) {
  const theme = useTheme();
  const loyalty = computeLoyalty(gamesPlayed);
  const inCycle = gamesPlayed % loyalty.freeAfter || (loyalty.isFreeNext ? loyalty.freeAfter : 0);
  const progress = loyalty.isFreeNext ? 1 : inCycle / loyalty.freeAfter;

  return (
    <Card elevation="sm" className="gap-sm">
      <View className="flex-row items-center justify-between">
        <Typography variant="label-md" color={theme.inkMuted}>
          Loyalty
        </Typography>
        <Typography variant="label-md" color={theme.primary}>
          {loyalty.isFreeNext ? '🎉 Free game ready' : `${loyalty.toNextFree} to a free game`}
        </Typography>
      </View>
      <View className="h-2.5 w-full rounded-full" style={{ backgroundColor: theme.cardMuted }}>
        <View
          className="h-2.5 rounded-full"
          style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: theme.primary }}
        />
      </View>
      <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
        {inCycle} / {loyalty.freeAfter} games this cycle
      </Typography>
    </Card>
  );
}
