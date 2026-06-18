import { View } from 'react-native';

import { Card, SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { SportType } from '@/types';

/** The header card summarising the chosen court, sport, time and slot price. */
export function CourtSummaryCard({
  sport,
  sportName,
  court,
  displayTime,
  unitPrice,
  hasCourt,
}: {
  sport: SportType;
  sportName: string;
  court: string;
  displayTime: string;
  unitPrice: number;
  hasCourt: boolean;
}) {
  const theme = useTheme();
  return (
    <Card variant="default" elevation="none" className="mt-md flex-row items-center gap-md">
      <SportGlyph slug={sport} size={48} />
      <View className="flex-1 gap-[2px]">
        {hasCourt ? (
          <>
            <Typography variant="headline-md">{court}</Typography>
            <Typography variant="body-md" color={theme.inkMuted}>
              {sportName} · {displayTime} · Rs {unitPrice}/slot
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="headline-md">Select a court</Typography>
            <Typography variant="body-md" color={theme.inkMuted}>
              Choose a court below to start the booking
            </Typography>
          </>
        )}
      </View>
    </Card>
  );
}
