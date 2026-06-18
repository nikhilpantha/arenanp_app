import { Pressable, View } from 'react-native';

import { Avatar, Badge, Card, Icon, Typography } from '@/components/common';
import { subscriptionBadge } from '@/components/venue/bookings/booking-meta';
import { useTheme } from '@/hooks/use-theme';
import type { Subscription } from '@/lib/api/subscriptions';
import { slotLabel } from '@/lib/subscription-format';

/** Card list of a venue's members (subscriptions), or a loading / empty state. */
export function MembersList({
  members,
  query,
  loading,
  onOpen,
}: {
  members: Subscription[];
  query: string;
  loading?: boolean;
  onOpen: (s: Subscription) => void;
}) {
  const theme = useTheme();

  if (members.length === 0) {
    return (
      <Card elevation="sm">
        <View className="items-center gap-sm py-xl">
          <Icon name="users" size={26} color={theme.inkMuted} />
          <Typography variant="body-md" color={theme.inkMuted}>
            {loading
              ? 'Loading members…'
              : query
                ? `No members match “${query}”.`
                : 'No members here yet.'}
          </Typography>
        </View>
      </Card>
    );
  }

  return (
    <Card elevation="sm">
      {members.map((m, i) => (
        <MemberRow key={m.id} member={m} divider={i < members.length - 1} onPress={() => onOpen(m)} />
      ))}
    </Card>
  );
}

export function MemberRow({
  member,
  divider,
  onPress,
}: {
  member: Subscription;
  divider: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const badge = subscriptionBadge(member.status, member.expiringSoon);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-md py-md"
      style={({ pressed }) => [
        { opacity: pressed ? 0.92 : 1 },
        divider ? { borderBottomWidth: 1, borderColor: theme.border } : null,
      ]}>
      <Avatar fallback={member.customerName} size={44} />
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-md" numberOfLines={1}>
          {member.customerName}
        </Typography>
        <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
          {member.planName} · {slotLabel(member.slotStart, member.sessionMinutes)}
        </Typography>
      </View>
      <Badge variant={badge.variant}>{badge.label}</Badge>
    </Pressable>
  );
}
