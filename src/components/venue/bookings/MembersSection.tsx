import { Pressable, View } from 'react-native';

import { Avatar, Badge, type BadgeVariant, Card, SectionHeader, Typography } from '@/components/common';
import { DURATION_LABEL, getTier, MEMBERS, MEMBERSHIP_STATS, MEMBERSHIP_TIERS } from '@/data/memberships';
import { useTheme } from '@/hooks/use-theme';
import type { MemberStatus } from '@/types';

const STATUS_BADGE: Record<MemberStatus, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  expiring: { variant: 'warning', label: 'Expiring' },
  expired: { variant: 'danger', label: 'Expired' },
};

export function MembersSection({
  onAddTier,
  onAddMember,
  onOpenMember,
}: {
  onAddTier: () => void;
  onAddMember: () => void;
  onOpenMember: (id: string) => void;
}) {
  const theme = useTheme();
  const stats = MEMBERSHIP_STATS;

  return (
    <View className="gap-xl">
      {/* Stats */}
      <View className="flex-row gap-sm">
        <Stat value={String(stats.activeMembers)} label="Active" theme={theme} />
        <Stat value={String(stats.expiringSoon)} label="Expiring" theme={theme} />
        <Stat value={`Rs ${Math.round(stats.monthlyRevenue / 1000)}k`} label="Monthly" theme={theme} />
      </View>

      {/* Plans */}
      <View className="gap-sm">
        <SectionHeader title="Membership plans" actionLabel="New plan" onActionPress={onAddTier} />
        {MEMBERSHIP_TIERS.map((t) => (
          <Card key={t.id} elevation="sm" className="gap-xs">
            <View className="flex-row items-center justify-between">
              <Typography variant="label-lg">{t.name}</Typography>
              {t.highlight ? <Badge variant="verified">{t.highlight}</Badge> : null}
            </View>
            <Typography variant="body-md" color={theme.inkMuted}>
              {t.sportsIncluded.length} sports · {t.daysOfWeek.length} days/week
            </Typography>
            <Typography variant="headline-md" color={theme.primary}>
              Rs {t.price}
              <Typography variant="label-sm" color={theme.inkMuted}>
                {' '}
                / {DURATION_LABEL[t.duration]}
              </Typography>
            </Typography>
          </Card>
        ))}
      </View>

      {/* Members */}
      <View className="gap-sm">
        <SectionHeader title="Members" actionLabel="Add" onActionPress={onAddMember} />
        <Card elevation="sm">
          {MEMBERS.map((m, i) => {
            const tier = getTier(m.tierId);
            const badge = STATUS_BADGE[m.status];
            return (
              <Pressable
                key={m.id}
                onPress={() => onOpenMember(m.id)}
                className="flex-row items-center gap-md py-md"
                style={({ pressed }) => [
                  { opacity: pressed ? 0.92 : 1 },
                  i < MEMBERS.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : null,
                ]}>
                <Avatar fallback={m.name} size={44} />
                <View className="flex-1 gap-[2px]">
                  <Typography variant="label-md">{m.name}</Typography>
                  <Typography variant="body-md" color={theme.inkMuted}>
                    {tier?.name ?? 'Member'} · {m.remainingSessions} left
                  </Typography>
                </View>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </Pressable>
            );
          })}
        </Card>
      </View>
    </View>
  );
}

function Stat({ value, label, theme }: { value: string; label: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <Card elevation="sm" className="flex-1 gap-[2px]">
      <Typography variant="headline-md">{value}</Typography>
      <Typography variant="label-sm" color={theme.inkMuted}>
        {label}
      </Typography>
    </Card>
  );
}
