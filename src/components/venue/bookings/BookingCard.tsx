import { Pressable, View } from 'react-native';

import { Badge, Card, Icon, SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { VenueBooking } from '@/types';

import { paymentBadge, statusBadge } from './booking-meta';

/** A single booking row used in the Today and Upcoming tabs. Tap = details, gear = manage. */
export function BookingCard({
  booking,
  onPress,
  onManage,
}: {
  booking: VenueBooking;
  onPress: () => void;
  onManage: () => void;
}) {
  const theme = useTheme();
  const status = statusBadge(booking.status);
  const pay = paymentBadge(booking);

  return (
    <Card elevation="sm" onPress={onPress} className="flex-row items-center gap-md">
      {/* Time block */}
      <View className="items-center" style={{ width: 56 }}>
        <Typography variant="label-lg" color={theme.primary}>
          {booking.startLabel}
        </Typography>
        <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
          {booking.endLabel}
        </Typography>
      </View>

      <View className="w-px self-stretch" style={{ backgroundColor: theme.border }} />

      {/* Customer + court + badges */}
      <View className="flex-1 gap-xs">
        <Typography variant="label-lg" numberOfLines={1}>
          {booking.customer}
        </Typography>
        <View className="flex-row items-center gap-xs">
          <SportGlyph slug={booking.sport} size={16} />
          <Typography
            variant="body-md"
            color={theme.inkMuted}
            numberOfLines={1}
            style={{ flexShrink: 1 }}>
            {booking.court}
          </Typography>
        </View>
        <View className="flex-row flex-wrap gap-xs">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Badge variant={pay.variant}>{pay.label}</Badge>
        </View>
      </View>

      {/* Manage */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Manage booking for ${booking.customer}`}
        onPress={onManage}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.cardMuted }}>
        <Icon name="settings" size={18} color={theme.ink} />
      </Pressable>
    </Card>
  );
}
