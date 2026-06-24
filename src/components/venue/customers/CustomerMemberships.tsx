import { View } from 'react-native';

import { Badge, Card, InlineLoader, Typography } from '@/components/common';
import { subscriptionBadge } from '@/components/venue/bookings/booking-meta';
import { useTheme } from '@/hooks/use-theme';
import type { Subscription } from '@/lib/api/subscriptions';
import { shortDate, slotLabel } from '@/lib/subscription-format';

/** The customer's memberships, shown on the unified profile alongside their bookings. */
export function CustomerMemberships({
  subscriptions,
  loading,
}: {
  subscriptions: Subscription[];
  loading: boolean;
}) {
  const theme = useTheme();

  if (loading) return <InlineLoader paddingVertical={16} />;
  if (subscriptions.length === 0) return null;

  return (
    <Card elevation="sm" className="gap-md">
      <Typography variant="label-lg">Memberships</Typography>
      <View className="gap-sm">
        {subscriptions.map((s) => {
          const badge = subscriptionBadge(s.status, s.expiringSoon);
          return (
            <View
              key={s.id}
              className="flex-row items-center justify-between border-t pt-sm"
              style={{ borderColor: theme.border }}>
              <View className="flex-1 pr-sm">
                <Typography variant="label-md" numberOfLines={1}>
                  {s.planName}
                </Typography>
                <Typography variant="body-sm" color={theme.inkMuted}>
                  {s.courtName} · {slotLabel(s.slotStart, s.sessionMinutes)} · expires{' '}
                  {shortDate(s.expiresAt)}
                </Typography>
              </View>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
