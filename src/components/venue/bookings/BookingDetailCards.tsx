import { View } from 'react-native';

import { Badge, Button, Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

import type { BadgeMeta } from './booking-meta';

/** Sport + court + time, with status/payment badges — the detail screen header card. */
export function BookingHero({
  emoji,
  title,
  time,
  status,
  payment,
}: {
  emoji: string;
  title: string;
  time?: string;
  status: BadgeMeta;
  payment: BadgeMeta | null;
}) {
  const theme = useTheme();
  return (
    <Card elevation="md" className="flex-row items-center gap-md">
      <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.cardMuted }}>
        <Typography variant="headline-md" style={{ textTransform: 'none' }}>
          {emoji}
        </Typography>
      </View>
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-lg">{title}</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          {time}
        </Typography>
      </View>
      <View className="items-end gap-xs">
        <Badge variant={status.variant}>{status.label}</Badge>
        {payment ? <Badge variant={payment.variant}>{payment.label}</Badge> : null}
      </View>
    </Card>
  );
}

/** Customer name + phone with a call action. */
export function BookingCustomerCard({ name, phone, onCall }: { name: string; phone?: string; onCall: () => void }) {
  const theme = useTheme();
  return (
    <Card elevation="sm" className="flex-row items-center gap-md">
      <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: theme.cardMuted }}>
        <Icon name="user" size={20} color={theme.primary} />
      </View>
      <View className="flex-1">
        <Typography variant="label-md">{name}</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          {phone || 'Customer'}
        </Typography>
      </View>
      {phone ? (
        <Button variant="tertiary" size="sm" leftIcon="bell" onPress={onCall}>
          Call
        </Button>
      ) : null}
    </Card>
  );
}

/** Label/value rows (date, time, court, amount, …). */
export function BookingFacts({ rows }: { rows: { label: string; value: string }[] }) {
  const theme = useTheme();
  return (
    <Card elevation="sm" className="gap-sm">
      {rows.map((r) => (
        <View key={r.label} className="flex-row items-center justify-between">
          <Typography variant="body-md" color={theme.inkMuted}>
            {r.label}
          </Typography>
          <Typography variant="label-md" color={theme.ink}>
            {r.value}
          </Typography>
        </View>
      ))}
    </Card>
  );
}
