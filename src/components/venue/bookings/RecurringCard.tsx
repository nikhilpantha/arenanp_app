import { View } from 'react-native';

import { Badge, Button, Card, Icon, type IconName, SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { RecurringBooking } from '@/types';

import { recurringBadge } from './booking-meta';

/** A subscription slot card — sessions, next date, package amount, renewal + actions. */
export function RecurringCard({
  booking,
  onPause,
  onRenew,
  onCancel,
}: {
  booking: RecurringBooking;
  onPause: () => void;
  onRenew: () => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const badge = recurringBadge(booking.status);
  const paused = booking.status === 'paused';

  const stats: { icon: IconName; label: string; value: string }[] = [
    { icon: 'repeat', label: 'Remaining', value: `${booking.remainingSessions}/${booking.totalSessions}` },
    { icon: 'calendarDays', label: 'Next session', value: booking.nextSession },
    { icon: 'dollarSign', label: 'Package', value: `Rs ${booking.packageAmount.toLocaleString('en-IN')}` },
    { icon: 'clock', label: 'Renews', value: booking.renewalDate },
  ];

  return (
    <Card elevation="sm" className="gap-md">
      <View className="flex-row items-center gap-md">
        <SportGlyph slug={booking.sport} size={44} />
        <View className="flex-1 gap-[2px]">
          <Typography variant="label-lg">{booking.customer}</Typography>
          <Typography variant="body-md" color={theme.inkMuted}>
            {booking.cadence} · {booking.timeLabel}
          </Typography>
        </View>
        <Badge variant={badge.variant}>{badge.label}</Badge>
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

      <View className="flex-row gap-sm">
        <Button variant="tertiary" size="sm" className="flex-1" onPress={onPause}>
          {paused ? 'Resume' : 'Pause'}
        </Button>
        <Button variant="primary" size="sm" className="flex-1" onPress={onRenew}>
          Renew
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onPress={onCancel}>
          Cancel
        </Button>
      </View>
    </Card>
  );
}
