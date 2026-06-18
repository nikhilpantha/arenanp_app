import { View } from 'react-native';

import { Badge, Card, Icon, type IconName, SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { RecurringBooking } from '@/types';

import { recurringBadge } from './booking-meta';

/** A membership slot card — tap to open the member detail (manage pause/renew/cancel there). */
export function RecurringCard({
  booking,
  onPress,
}: {
  booking: RecurringBooking;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const badge = recurringBadge(booking.status);

  const stats: { icon: IconName; label: string; value: string }[] = [
    { icon: 'clock', label: 'Session', value: booking.sessionLabel },
    {
      icon: 'dollarSign',
      label: 'Package',
      value: `Rs ${booking.packageAmount.toLocaleString('en-IN')}`,
    },
    { icon: 'calendarDays', label: 'Starts', value: booking.startDate },
    { icon: 'calendarDays', label: 'Ends', value: booking.renewalDate },
  ];

  return (
    <Card elevation="sm" className="gap-md" onPress={onPress}>
      <View className="flex-row items-center gap-md">
        <SportGlyph slug={booking.sport} size={44} />
        <View className="flex-1 gap-[2px]">
          <Typography variant="label-lg">{booking.customer}</Typography>
          {/* Slot time, emphasised; cadence trails it in muted text. */}
          <View className="flex-row items-center gap-xs">
            <Icon name="clock" size={14} color={theme.primary} />
            <Typography variant="label-md" color={theme.ink}>
              {booking.timeLabel}
            </Typography>
            <Typography variant="body-md" color={theme.inkMuted}>
              · {booking.cadence}
            </Typography>
          </View>
        </View>
        <Badge variant={badge.variant}>{badge.label}</Badge>
        {onPress ? <Icon name="chevronRight" size={18} color={theme.inkMuted} /> : null}
      </View>

      <Typography variant="label-sm" color={theme.inkMuted}>
        {booking.packageName} · {booking.court}
      </Typography>

      {/* 2×2 stat grid */}
      <View className="flex-row flex-wrap" style={{ rowGap: 12 }}>
        {stats.map((s) => (
          <View key={s.label} className="w-1/2 flex-row items-center gap-sm">
            <Icon name={s.icon} size={16} color={theme.primary} />
            <View>
              <Typography variant="label-md">{s.value}</Typography>
              <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                {s.label}
              </Typography>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
