import { View } from 'react-native';

import { Button, Card, Typography } from '@/components/common';
import { SPORTS_CATALOG } from '@/data/sports';
import { useTheme } from '@/hooks/use-theme';
import type { BookingRequest } from '@/types';

/** A pending online booking with Accept / Decline actions. */
export function RequestCard({
  request,
  onAccept,
  onDecline,
}: {
  request: BookingRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const theme = useTheme();
  const entry = SPORTS_CATALOG.find((e) => e.sport === request.sport);

  return (
    <Card elevation="sm" className="gap-md">
      <View className="flex-row items-center gap-md">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: theme.cardMuted }}>
          <Typography variant="headline-md" style={{ textTransform: 'none' }}>
            {entry?.emoji ?? '🏟️'}
          </Typography>
        </View>
        <View className="flex-1 gap-[2px]">
          <Typography variant="label-lg">{request.customerName}</Typography>
          <Typography variant="body-md" color={theme.inkMuted}>
            {entry?.label ?? request.sport} · {request.court}
          </Typography>
        </View>
        <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
          {request.requestedAt}
        </Typography>
      </View>

      <View className="flex-row items-center justify-between">
        <Typography variant="body-md" color={theme.ink}>
          {request.date} · {request.time} · {request.durationHours}h
        </Typography>
        <Typography variant="label-md" color={theme.primary}>
          Rs {request.price}
        </Typography>
      </View>

      <View className="flex-row gap-sm">
        <View className="flex-1">
          <Button variant="ghost" size="md" fullWidth onPress={onDecline}>
            Decline
          </Button>
        </View>
        <View className="flex-1">
          <Button size="md" fullWidth rightIcon="check" onPress={onAccept}>
            Accept
          </Button>
        </View>
      </View>
    </Card>
  );
}
