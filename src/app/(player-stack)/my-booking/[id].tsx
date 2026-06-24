import { useMemo } from 'react';
import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  Badge,
  Button,
  Card,
  Icon,
  InlineLoader,
  Screen,
  ScreenHeader,
  Typography,
  useToast,
} from '@/components/common';
import { isCancellable, playerBookingStatus } from '@/components/player/games/booking-status';
import { useRefresh } from '@/hooks/use-refresh';
import { useTheme } from '@/hooks/use-theme';
import { useCancelMyBooking, useMyBookings } from '@/lib/api/player-bookings';
import { pad, to12h } from '@/lib/time';

const PAYMENT_LABEL: Record<string, string> = {
  PAID: 'Paid',
  PARTIAL: 'Partially paid',
  PENDING: 'Pay at the venue',
};

export default function PlayerBookingDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();

  const q = useMyBookings();
  const { refreshing, onRefresh } = useRefresh(q);
  const booking = useMemo(
    () => q.data?.pages.flatMap((p) => p.items).find((b) => b.id === id),
    [q.data, id],
  );
  const cancel = useCancelMyBooking();

  const header = <ScreenHeader title="Booking" onBack={() => router.back()} />;

  if (!booking) {
    return (
      <Screen scroll refreshing={refreshing} onRefresh={onRefresh}>
        <View className="pt-sm">{header}</View>
        {q.isLoading ? (
          <InlineLoader paddingVertical={64} />
        ) : (
          <View className="flex-1 items-center justify-center gap-sm pt-xl">
            <Icon name="calendarDays" size={28} color={theme.inkMuted} />
            <Typography variant="label-lg">Booking not found</Typography>
          </View>
        )}
      </Screen>
    );
  }

  const status = playerBookingStatus(booking.status);
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);
  const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const dateLabel = start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const timeLabel = `${to12h(hhmm(start))} – ${to12h(hhmm(end))}`;
  const hours = Math.max(1, Math.round(booking.durationMinutes / 60));
  const location = [booking.venueAddress, booking.venueCity].filter(Boolean).join(', ');

  const onCancel = () =>
    Alert.alert('Cancel booking?', `Cancel your ${booking.sport.name} booking at ${booking.venueName}?`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: () =>
          cancel.mutate(
            { bookingId: booking.id },
            { onSuccess: () => toast.success('Booking cancelled') },
          ),
      },
    ]);

  const rows = [
    { label: 'Court', value: `${booking.courtName} · ${booking.sport.name}` },
    { label: 'Date', value: dateLabel },
    { label: 'Time', value: `${timeLabel} · ${hours}h` },
    { label: 'Payment', value: PAYMENT_LABEL[booking.paymentStatus] ?? booking.paymentStatus },
    { label: 'Total', value: `Rs ${booking.total}` },
  ];

  return (
    <Screen scroll refreshing={refreshing} onRefresh={onRefresh}>
      <View className="pt-sm">{header}</View>

      <View className="gap-lg pt-md">
        <Card elevation="md" className="gap-sm">
          <View className="flex-row items-center justify-between">
            <Typography variant="headline-md" numberOfLines={1} style={{ flex: 1 }}>
              {booking.venueName}
            </Typography>
            <Badge variant={status.variant}>{status.label}</Badge>
          </View>
          {booking.status === 'PENDING_PAYMENT' ? (
            <Typography variant="body-md" color={theme.inkMuted}>
              Waiting for the venue to confirm your request.
            </Typography>
          ) : null}
        </Card>

        <Card elevation="sm" className="gap-sm">
          {rows.map((r, i) => (
            <View
              key={r.label}
              className="flex-row items-center justify-between gap-md py-xs"
              style={i < rows.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : undefined}>
              <Typography variant="body-md" color={theme.inkMuted}>
                {r.label}
              </Typography>
              <Typography variant="label-md" style={{ flex: 1, textAlign: 'right' }}>
                {r.value}
              </Typography>
            </View>
          ))}
        </Card>

        {location ? (
          <View className="flex-row items-center gap-xs">
            <Icon name="mapPin" size={15} color={theme.inkMuted} />
            <Typography variant="body-md" color={theme.inkMuted} style={{ flex: 1 }}>
              {location}
            </Typography>
          </View>
        ) : null}

        <View className="gap-sm">
          <Button
            size="lg"
            variant="secondary"
            fullWidth
            leftIcon="building"
            className="rounded-full"
            onPress={() =>
              router.push({ pathname: '/venue/[id]', params: { id: booking.venueId, name: booking.venueName } })
            }>
            View venue
          </Button>
          {isCancellable(booking.status) ? (
            <Button
              size="lg"
              variant="tertiary"
              fullWidth
              leftIcon="xCircle"
              loading={cancel.isPending}
              className="rounded-full"
              style={{ borderColor: theme.danger }}
              onPress={onCancel}>
              Cancel booking
            </Button>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
