import { View } from 'react-native';

import { Badge, Card, Icon, Typography } from '@/components/common';
import { subscriptionBadge } from '@/components/venue/bookings/booking-meta';
import { useTheme } from '@/hooks/use-theme';
import type { Subscription } from '@/lib/api/subscriptions';
import { cadenceLabel, shortDate, slotLabel } from '@/lib/subscription-format';

/** A player's membership row in My Games — plan, court + cadence, slot time, status, expiry. */
export function MembershipCard({ sub }: { sub: Subscription }) {
  const theme = useTheme();
  const badge = subscriptionBadge(sub.status, sub.expiringSoon);

  return (
    <Card elevation="sm" className="gap-sm">
      <View className="flex-row items-center justify-between gap-md">
        <Typography variant="label-md" numberOfLines={1} style={{ flex: 1 }}>
          {sub.planName}
        </Typography>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </View>

      <View className="flex-row items-center gap-xs">
        <Icon name="repeat" size={14} color={theme.inkMuted} />
        <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
          {sub.courtName} · {cadenceLabel(sub.daysOfWeek)}
        </Typography>
      </View>

      <View
        className="flex-row items-center justify-between border-t pt-sm"
        style={{ borderColor: theme.border }}>
        <Typography variant="body-md" color={theme.inkMuted}>
          {slotLabel(sub.slotStart, sub.sessionMinutes)}
        </Typography>
        <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
          till {shortDate(sub.expiresAt)}
        </Typography>
      </View>
    </Card>
  );
}
