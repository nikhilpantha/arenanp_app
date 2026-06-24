import { View } from 'react-native';

import { Badge, Card, SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { PlayerBooking } from '@/lib/api/player-bookings';
import { pad, to12h } from '@/lib/time';

import { playerBookingStatus } from './booking-status';

function timeRange(startAt: string, endAt: string): string {
  const s = new Date(startAt);
  const e = new Date(endAt);
  const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${to12h(hhmm(s))} – ${to12h(hhmm(e))}`;
}

/** A player's booking row in My Games — venue, court, time, status + total. */
export function PlayerBookingCard({ booking, onPress }: { booking: PlayerBooking; onPress: () => void }) {
  const theme = useTheme();
  const status = playerBookingStatus(booking.status);
  const dateLabel = new Date(booking.startAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card elevation="sm" onPress={onPress} className="gap-sm">
      <View className="flex-row items-center gap-md">
        <SportGlyph slug={booking.sport.slug} size={40} />
        <View className="flex-1 gap-[2px]">
          <Typography variant="label-md" numberOfLines={1}>
            {booking.venueName}
          </Typography>
          <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
            {booking.courtName} · {booking.sport.name}
          </Typography>
        </View>
        <Badge variant={status.variant}>{status.label}</Badge>
      </View>

      <View
        className="flex-row items-center justify-between border-t pt-sm"
        style={{ borderColor: theme.border }}>
        <Typography variant="body-md" color={theme.inkMuted}>
          {dateLabel} · {timeRange(booking.startAt, booking.endAt)}
        </Typography>
        <Typography variant="label-md" color={theme.ink}>
          Rs {booking.total}
        </Typography>
      </View>
    </Card>
  );
}
