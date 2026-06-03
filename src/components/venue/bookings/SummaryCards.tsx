import { ScrollView, View } from 'react-native';

import { Card, Icon, type IconName, Typography } from '@/components/common';
import { BOOKING_SUMMARY } from '@/data/venue-bookings';
import { useTheme } from '@/hooks/use-theme';

/** Quick-glance overview chips above the booking lists (today's pulse of the venue). */
export function SummaryCards() {
  const theme = useTheme();

  const items: { icon: IconName; value: string; label: string; tint: string }[] = [
    { icon: 'calendarDays', value: String(BOOKING_SUMMARY.bookingsToday), label: 'Bookings today', tint: theme.primary },
    { icon: 'dollarSign', value: `Rs ${(BOOKING_SUMMARY.revenueToday / 1000).toFixed(0)}k`, label: 'Revenue today', tint: theme.primaryDark },
    { icon: 'creditCard', value: String(BOOKING_SUMMARY.pendingPayments), label: 'Pending payments', tint: theme.danger },
    { icon: 'award', value: String(BOOKING_SUMMARY.freeGamesDue), label: 'Free games due', tint: theme.secondaryDark },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
      {items.map((it) => (
        <Card key={it.label} elevation="sm" style={{ width: 148 }} className="gap-md">
          <View className="h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${it.tint}1A` }}>
            <Icon name={it.icon} size={16} color={it.tint} />
          </View>
          <View className="gap-[1px]">
            <Typography variant="headline-md">{it.value}</Typography>
            <Typography variant="label-sm" color={theme.inkMuted}>
              {it.label}
            </Typography>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
