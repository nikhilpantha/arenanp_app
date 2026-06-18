import { View } from 'react-native';

import { Badge, Card, Icon, SportGlyph, Typography } from '@/components/common';
import { resolveStatusBadge } from '@/components/venue/bookings/booking-meta';
import { useTheme } from '@/hooks/use-theme';
import type { VenueBooking } from '@/types';

/** A customer's booking history — one row per booking, or an empty state. */
export function CustomerBookingHistory({
  bookings,
  loading,
}: {
  bookings: VenueBooking[];
  loading?: boolean;
}) {
  const theme = useTheme();

  return (
    <View className="gap-sm pt-lg">
      <Typography variant="label-md" color={theme.inkMuted}>
        Booking history
      </Typography>
      {bookings.length === 0 ? (
        <Card elevation="sm">
          <View className="items-center gap-sm py-xl">
            <Icon name="calendar" size={24} color={theme.inkMuted} />
            <Typography variant="body-md" color={theme.inkMuted}>
              {loading ? 'Loading history…' : 'No bookings yet.'}
            </Typography>
          </View>
        </Card>
      ) : (
        <Card elevation="sm">
          {bookings.map((b, i) => {
            const badge = resolveStatusBadge(b.status);
            return (
              <View
                key={b.id}
                className="flex-row items-center gap-md py-sm"
                style={i < bookings.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : undefined}>
                <SportGlyph slug={b.sport} size={28} />
                <View className="flex-1 gap-[2px]">
                  <Typography variant="label-md" numberOfLines={1}>
                    {b.court}
                  </Typography>
                  <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
                    {b.date} · {b.startLabel}
                  </Typography>
                </View>
                <View className="items-end gap-[2px]">
                  <Typography variant="label-md">{b.freeGame ? 'Free' : `Rs ${b.amount}`}</Typography>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </View>
              </View>
            );
          })}
        </Card>
      )}
    </View>
  );
}
