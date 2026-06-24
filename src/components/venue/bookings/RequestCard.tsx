import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Badge, Button, Card, Icon, type IconName, SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { useSportBySlug } from '@/lib/api/sports';
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
  const sportName = useSportBySlug(request.sport)?.name ?? request.sport;

  return (
    <Card elevation="md" className="overflow-hidden" style={{ padding: 0 }}>
      {/* A primary accent bar reads "needs your attention" at a glance. */}
      <View style={{ height: 4, backgroundColor: theme.primary }} />

      <View className="gap-md p-md">
        {/* Who — name + tappable phone — with status + how long it's been waiting. */}
        <View className="flex-row items-center gap-md">
          <View
            className="items-center justify-center rounded-2xl"
            style={{ width: 52, height: 52, backgroundColor: `${theme.primary}14` }}>
            <SportGlyph slug={request.sport} size={36} />
          </View>
          <View className="flex-1 gap-[2px]">
            <Typography variant="label-lg" numberOfLines={1}>
              {request.customerName}
            </Typography>
            {request.phone ? (
              <Pressable
                onPress={() => Linking.openURL(`tel:${request.phone}`).catch(() => undefined)}
                accessibilityRole="button"
                accessibilityLabel={`Call ${request.phone}`}
                className="flex-row items-center gap-xs">
                <Icon name="phone" size={13} color={theme.primary} />
                <Typography
                  variant="body-md"
                  color={theme.primary}
                  style={{ textTransform: 'none' }}>
                  {request.phone}
                </Typography>
              </Pressable>
            ) : (
              <Typography variant="body-md" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                Online booking
              </Typography>
            )}
          </View>
          <View className="items-end gap-[6px]">
            <Badge variant="warning">Pending</Badge>
            <Typography
              variant="label-sm"
              color={theme.inkSubtle}
              style={{ textTransform: 'none' }}>
              {request.requestedAt}
            </Typography>
          </View>
        </View>

        {/* What they want — court/sport, when, and the total. */}
        <View className="gap-sm rounded-2xl p-md" style={{ backgroundColor: theme.cardMuted }}>
          <DetailRow icon="building" value={`${sportName} · ${request.court}`} />
          <DetailRow
            icon="calendarDays"
            value={`${request.date} · ${request.time} · ${request.durationHours}h`}
          />
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: theme.border,
              marginVertical: 2,
            }}
          />
          <View className="flex-row items-center justify-between">
            <Typography variant="body-md" color={theme.inkMuted}>
              Total
            </Typography>
            <Typography variant="headline-md" color={theme.primaryDark}>
              Rs {request.price}
            </Typography>
          </View>
        </View>

        <View className="flex-row gap-sm">
          <View className="flex-1">
            <Button variant="ghost" size="md" fullWidth leftIcon="x" onPress={onDecline}>
              Decline
            </Button>
          </View>
          <View className="flex-1">
            <Button size="md" fullWidth rightIcon="check" onPress={onAccept}>
              Accept
            </Button>
          </View>
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
