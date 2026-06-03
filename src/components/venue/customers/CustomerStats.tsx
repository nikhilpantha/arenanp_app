import { View } from 'react-native';

import { Card, Typography } from '@/components/common';
import { CUSTOMERS } from '@/data/customers';
import { useTheme } from '@/hooks/use-theme';
import { computeLoyalty } from '@/lib/loyalty';

/** Two quick chips above the customer list — total customers + free games due. */
export function CustomerStats() {
  const theme = useTheme();
  const freeGamesDue = CUSTOMERS.filter((c) => computeLoyalty(c.gamesPlayed).isFreeNext).length;

  return (
    <View className="flex-row gap-sm">
      <StatChip value={String(CUSTOMERS.length)} label="Total" />
      <StatChip value={String(freeGamesDue)} label="Free games due" tint={theme.secondaryDark} />
    </View>
  );
}

function StatChip({ value, label, tint }: { value: string; label: string; tint?: string }) {
  const theme = useTheme();
  return (
    <Card elevation="sm" className="flex-1 gap-[2px]">
      <Typography variant="headline-md" color={tint}>
        {value}
      </Typography>
      <Typography variant="label-sm" color={theme.inkMuted}>
        {label}
      </Typography>
    </Card>
  );
}
