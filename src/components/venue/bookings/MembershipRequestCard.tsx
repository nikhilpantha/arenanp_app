import { Linking, Pressable, View } from 'react-native';

import { Button, Card, Icon, type IconName, SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { useSportBySlug } from '@/lib/api/sports';
import type { Subscription } from '@/lib/api/subscriptions';
import { cadenceLabel, shortDate, slotLabel } from '@/lib/subscription-format';

/** A pending membership request with Accept / Decline actions (venue Requests tab). */
export function MembershipRequestCard({
  request,
  onAccept,
  onDecline,
  loading,
}: {
  request: Subscription;
  onAccept: () => void;
  onDecline: () => void;
  loading?: boolean;
}) {
  const theme = useTheme();
  const sportName = useSportBySlug(request.sports[0])?.name ?? request.sports[0] ?? 'Membership';

  return (
    <Card elevation="sm" className="gap-md">
      <View className="flex-row items-center gap-md">
        <SportGlyph slug={request.sports[0] ?? 'futsal'} size={48} />
        <View className="flex-1 gap-[2px]">
          <Typography variant="label-lg" numberOfLines={1}>
            {request.customerName}
          </Typography>
          {request.customerPhone ? (
            <Pressable
              onPress={() => Linking.openURL(`tel:${request.customerPhone}`).catch(() => undefined)}
              accessibilityRole="button"
              accessibilityLabel={`Call ${request.customerPhone}`}
              className="flex-row items-center gap-xs">
              <Icon name="phone" size={13} color={theme.primary} />
              <Typography variant="body-md" color={theme.primary} style={{ textTransform: 'none' }}>
                {request.customerPhone}
              </Typography>
            </Pressable>
          ) : null}
        </View>
        <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
          Membership
        </Typography>
      </View>

      <View className="gap-sm rounded-2xl p-md" style={{ backgroundColor: theme.cardMuted }}>
        <DetailRow icon="repeat" value={request.planName} />
        <DetailRow icon="building" value={`${request.courtName} · ${sportName}`} />
        <DetailRow
          icon="calendarDays"
          value={`${cadenceLabel(request.daysOfWeek)} · ${slotLabel(request.slotStart, request.sessionMinutes)}`}
        />
        <DetailRow icon="clock" value={`Starts ${shortDate(request.startedAt)}`} />
        <View className="flex-row items-center justify-between">
          <Typography variant="body-md" color={theme.inkMuted}>
            Total
          </Typography>
          <Typography variant="label-md" color={theme.primary}>
            Rs {request.price}
          </Typography>
        </View>
      </View>

      <View className="flex-row gap-sm">
        <View className="flex-1">
          <Button variant="ghost" size="md" fullWidth disabled={loading} onPress={onDecline}>
            Decline
          </Button>
        </View>
        <View className="flex-1">
          <Button size="md" fullWidth rightIcon="check" loading={loading} onPress={onAccept}>
            Accept
          </Button>
        </View>
      </View>
    </Card>
  );
}

function DetailRow({ icon, value }: { icon: IconName; value: string }) {
  const theme = useTheme();
  return (
    <View className="flex-row items-center gap-sm">
      <Icon name={icon} size={15} color={theme.inkMuted} />
      <Typography variant="body-md" color={theme.ink} numberOfLines={1} style={{ flex: 1 }}>
        {value}
      </Typography>
    </View>
  );
}
