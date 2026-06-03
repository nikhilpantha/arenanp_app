import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Avatar, Badge, type BadgeVariant, Button, Card, Icon, Screen, ScreenHeader, Typography } from '@/components/common';
import { getMember, getTier } from '@/data/memberships';
import { useTheme } from '@/hooks/use-theme';
import type { MemberStatus } from '@/types';

const STATUS_BADGE: Record<MemberStatus, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  expiring: { variant: 'warning', label: 'Expiring soon' },
  expired: { variant: 'danger', label: 'Expired' },
};

export default function MemberDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const member = getMember(id ?? '');
  const tier = member ? getTier(member.tierId) : null;

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Member" onBack={() => router.back()} />
      </View>

      {!member ? (
        <View className="flex-1 items-center justify-center gap-sm pt-xl">
          <Icon name="users" size={28} color={theme.inkMuted} />
          <Typography variant="label-lg">Member not found</Typography>
        </View>
      ) : (
        <>
          <Card elevation="md" className="mt-md flex-row items-center gap-md">
            <Avatar fallback={member.name} size={52} />
            <View className="flex-1 gap-[2px]">
              <Typography variant="headline-md">{member.name}</Typography>
              <Typography variant="body-md" color={theme.inkMuted}>
                {member.phone}
              </Typography>
            </View>
            <Badge variant={STATUS_BADGE[member.status].variant}>
              {STATUS_BADGE[member.status].label}
            </Badge>
          </Card>

          <Card elevation="sm" className="mt-md gap-sm">
            <Row label="Plan" value={tier?.name ?? '—'} theme={theme} />
            <Row label="Sessions left" value={`${member.remainingSessions} / ${member.totalSessions}`} theme={theme} />
            <Row label="Joined" value={member.joinedAt} theme={theme} />
            <Row label="Expires" value={member.expiresAt} theme={theme} />
          </Card>

          {member.payments.length > 0 ? (
            <View className="gap-sm pt-lg">
              <Typography variant="label-md" color={theme.inkMuted}>
                Payment history
              </Typography>
              <Card elevation="sm">
                {member.payments.map((p, i) => (
                  <View
                    key={p.id}
                    className="flex-row items-center justify-between py-sm"
                    style={i < member.payments.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : undefined}>
                    <View className="gap-[2px]">
                      <Typography variant="label-md">Rs {p.amount}</Typography>
                      <Typography variant="body-md" color={theme.inkMuted}>
                        {p.date} · {p.method}
                      </Typography>
                    </View>
                    <Badge variant={p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}>
                      {p.status}
                    </Badge>
                  </View>
                ))}
              </Card>
            </View>
          ) : null}

          <View className="pt-xl">
            <Button
              size="lg"
              fullWidth
              className="rounded-full"
              rightIcon="check"
              onPress={() => Alert.alert('Membership renewed', undefined, [{ text: 'Done', onPress: () => router.back() }])}>
              Renew membership
            </Button>
          </View>
        </>
      )}
    </Screen>
  );
}

function Row({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View className="flex-row items-center justify-between">
      <Typography variant="body-md" color={theme.inkMuted}>
        {label}
      </Typography>
      <Typography variant="label-md" color={theme.ink}>
        {value}
      </Typography>
    </View>
  );
}
