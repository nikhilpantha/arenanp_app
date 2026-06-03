import { View } from 'react-native';

import { Card, Icon, type IconName, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { computeLoyalty } from '@/lib/loyalty';
import type { Customer } from '@/types';

/** The "who is this customer" panel owners love — games, spend, recency, loyalty. */
export function CustomerInsights({ customer }: { customer: Customer }) {
  const theme = useTheme();
  const loyalty = computeLoyalty(customer.gamesPlayed);

  const items: { icon: IconName; label: string; value: string }[] = [
    { icon: 'activity', label: 'Total games', value: String(customer.gamesPlayed) },
    { icon: 'dollarSign', label: 'Revenue', value: `Rs ${(customer.totalRevenue ?? 0).toLocaleString('en-IN')}` },
    { icon: 'clock', label: 'Last played', value: customer.lastPlayed ?? '—' },
    { icon: 'calendarDays', label: 'Preferred slot', value: customer.preferredSlot ?? '—' },
    { icon: 'award', label: 'Free games', value: loyalty.isFreeNext ? '1 available' : `${loyalty.toNextFree} to go` },
  ];

  return (
    <Card elevation="sm" className="gap-md">
      <Typography variant="label-md" color={theme.inkMuted}>
        Customer insights
      </Typography>
      <View className="flex-row flex-wrap" style={{ rowGap: 16 }}>
        {items.map((it) => (
          <View key={it.label} className="w-1/2 flex-row items-center gap-sm">
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${theme.primary}1A` }}>
              <Icon name={it.icon} size={16} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Typography variant="label-md" numberOfLines={1}>
                {it.value}
              </Typography>
              <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                {it.label}
              </Typography>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
