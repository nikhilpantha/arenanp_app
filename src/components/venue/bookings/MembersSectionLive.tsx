import { Pressable, View } from 'react-native';

import {
  Badge,
  Card,
  Icon,
  type IconName,
  InlineLoader,
  SectionHeader,
  Typography,
} from '@/components/common';
import { DURATION_LABEL } from '@/data/memberships';
import { useTheme } from '@/hooks/use-theme';
import { useMembershipPlans, useMembershipStats, useVenueSubscriptions } from '@/lib/api/subscriptions';

import { BookingsEmptyState } from './BookingsEmptyState';
import { MembersList } from './subscribe/MembersList';

/** Active members shown inline on the plans screen before the "View all" history. */
const PREVIEW_COUNT = 6;

/**
 * Live membership management: KPIs, the venue's plans, and the currently-running
 * members (with a "View all" into the full, searchable history).
 */
export function MembersSectionLive({
  onAddTier,
  onAddMember,
  onOpenPlan,
  onOpenMember,
  onViewMembers,
}: {
  onAddTier: () => void;
  onAddMember: () => void;
  onOpenPlan: (id: string) => void;
  onOpenMember: (id: string) => void;
  onViewMembers: () => void;
}) {
  const theme = useTheme();
  const statsQ = useMembershipStats();
  const plansQ = useMembershipPlans();
  const activeQ = useVenueSubscriptions('active');

  const stats = statsQ.data;
  const plans = plansQ.data ?? [];
  const active = activeQ.data ?? [];

  return (
    <View className="gap-xl">
      {stats ? (
        <View className="flex-row gap-sm">
          <Stat icon="users" value={String(stats.activeMembers)} label="Active" theme={theme} />
          <Stat
            icon="clock"
            value={String(stats.expiringSoon)}
            label="Expiring soon"
            tint={theme.secondaryDark}
            theme={theme}
          />
          <Stat
            icon="dollarSign"
            value={`Rs ${Math.round(stats.monthlyRevenue / 1000)}k`}
            label="This month"
            theme={theme}
          />
        </View>
      ) : null}

      {/* Membership plans */}
      <View className="gap-sm">
        <SectionHeader title="Membership plans" actionLabel="New plan" onActionPress={onAddTier} />
        {plansQ.isLoading ? (
          <InlineLoader />
        ) : plansQ.isError ? (
          <BookingsEmptyState
            icon="award"
            label="Couldn't load plans"
            hint={plansQ.error instanceof Error ? plansQ.error.message : 'Try again.'}
          />
        ) : plans.length === 0 ? (
          <BookingsEmptyState
            icon="award"
            label="No plans yet"
            hint="Create a plan so customers can subscribe."
            actionLabel="New plan"
            onAction={onAddTier}
          />
        ) : (
          <Card elevation="sm">
            {plans.map((t, i) => (
              <Pressable
                key={t.id}
                onPress={() => onOpenPlan(t.id)}
                className="gap-xs py-md"
                style={({ pressed }) => [
                  { opacity: pressed ? 0.92 : 1 },
                  i < plans.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : null,
                ]}>
                <View className="flex-row items-center justify-between">
                  <Typography variant="label-lg">{t.name}</Typography>
                  <View className="flex-row items-center gap-sm">
                    {t.highlight ? <Badge variant="verified">{t.highlight}</Badge> : null}
                    {!t.isActive ? <Badge variant="neutral">Inactive</Badge> : null}
                    <Icon name="chevronRight" size={18} color={theme.inkMuted} />
                  </View>
                </View>
                <Typography variant="body-md" color={theme.inkMuted}>
                  {t.sports.length} sports · {t.daysOfWeek.length} days/week
                </Typography>
                <Typography variant="headline-md" color={theme.primary}>
                  Rs {t.price}
                  <Typography variant="label-sm" color={theme.inkMuted}>
                    {' '}
                    / {DURATION_LABEL[t.duration]}
                  </Typography>
                </Typography>
              </Pressable>
            ))}
          </Card>
        )}
      </View>

      {/* Currently-running members (preview) + full history */}
      <View className="gap-sm">
        <SectionHeader title="Active members" actionLabel="View all" onActionPress={onViewMembers} />
        {activeQ.isLoading ? (
          <InlineLoader />
        ) : active.length === 0 ? (
          <BookingsEmptyState
            icon="users"
            label="No active members"
            hint="Subscribe a customer to one of your plans."
            actionLabel="New membership"
            onAction={onAddMember}
          />
        ) : (
          <MembersList
            members={active.slice(0, PREVIEW_COUNT)}
            query=""
            onOpen={(m) => onOpenMember(m.id)}
          />
        )}
      </View>
    </View>
  );
}

function Stat({
  icon,
  value,
  label,
  tint,
  theme,
}: {
  icon: IconName;
  value: string;
  label: string;
  tint?: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Card elevation="sm" className="flex-1 gap-xs">
      <Icon name={icon} size={18} color={tint ?? theme.primary} />
      <Typography variant="headline-md">{value}</Typography>
      <Typography variant="label-sm" color={theme.inkMuted}>
        {label}
      </Typography>
    </Card>
  );
}
