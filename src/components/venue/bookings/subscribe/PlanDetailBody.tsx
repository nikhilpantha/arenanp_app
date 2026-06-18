import { Pressable, View } from 'react-native';

import { Badge, Button, Card, Icon, SectionHeader, Typography } from '@/components/common';
import { DURATION_LABEL } from '@/data/memberships';
import { useTheme } from '@/hooks/use-theme';
import type { MembershipPlan, Subscription } from '@/lib/api/subscriptions';
import { cadenceLabel, formatTime, sessionLengthLabel } from '@/lib/subscription-format';

import { MembersList } from './MembersList';

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Plan detail body: summary, active-member preview, and lifecycle actions. */
export function PlanDetailBody({
  plan,
  members,
  membersLoading,
  toggling,
  deleting,
  onEdit,
  onToggleActive,
  onDelete,
  onViewAll,
  onOpenMember,
}: {
  plan: MembershipPlan;
  members: Subscription[];
  membersLoading: boolean;
  toggling: boolean;
  deleting: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onViewAll: () => void;
  onOpenMember: (id: string) => void;
}) {
  const theme = useTheme();
  const bands = plan.windows.map((w) => `${formatTime(w.start)} – ${formatTime(w.end)}`).join(', ');
  const sports = plan.sports.map(cap).join(', ') || '—';

  return (
    <>
      <Card elevation="md" className="mt-md flex-row items-center justify-between gap-md">
        <View className="flex-1 gap-[2px]">
          <Typography variant="headline-md">{plan.name}</Typography>
          <Typography variant="headline-md" color={theme.primary}>
            Rs {plan.price}
            <Typography variant="label-sm" color={theme.inkMuted}>
              {' '}
              / {DURATION_LABEL[plan.duration]}
            </Typography>
          </Typography>
        </View>
        <Badge variant={plan.isActive ? 'success' : 'neutral'}>
          {plan.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </Card>

      <Card elevation="sm" className="mt-md gap-sm">
        <Row label="Session length" value={sessionLengthLabel(plan.sessionMinutes)} theme={theme} />
        <Row label="Days" value={cadenceLabel(plan.daysOfWeek)} theme={theme} />
        <Row label="Time bands" value={bands || '—'} theme={theme} />
        <Row label="Sports" value={sports} theme={theme} />
      </Card>

      {/* Active members on this plan (full, filtered list behind View all). */}
      <View className="gap-sm pt-lg">
        <SectionHeader
          title="Active members"
          subtitle={`${plan.activeSubscribers} on this plan`}
          actionLabel="View all"
          onActionPress={onViewAll}
        />
        <MembersList
          members={members}
          query=""
          loading={membersLoading}
          onOpen={(m) => onOpenMember(m.id)}
        />
      </View>

      {/* Actions: a clear primary + secondary pair, with delete kept quiet + destructive. */}
      <View className="gap-md pt-xl">
        <View className="flex-row gap-sm">
          <Button size="lg" className="flex-1 rounded-full" leftIcon="settings" onPress={onEdit}>
            Edit
          </Button>
          <Button
            variant="tertiary"
            size="lg"
            className="flex-1 rounded-full"
            leftIcon={plan.isActive ? 'ban' : 'check'}
            loading={toggling}
            onPress={onToggleActive}>
            {plan.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </View>

        <View className="items-center gap-xs pt-sm">
          <Pressable
            onPress={onDelete}
            disabled={deleting}
            hitSlop={8}
            className="flex-row items-center gap-xs">
            <Icon name="xCircle" size={16} color={theme.danger} />
            <Typography variant="label-md" color={theme.danger}>
              {deleting ? 'Deleting…' : 'Delete plan'}
            </Typography>
          </Pressable>
          <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
            {plan.isActive
              ? 'Deactivating hides this plan from new memberships; existing members keep theirs.'
              : 'This plan is hidden from new memberships.'}{' '}
            It can be deleted only after all its memberships have ended.
          </Typography>
        </View>
      </View>
    </>
  );
}

function Row({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View className="flex-row items-start justify-between gap-md">
      <Typography variant="body-md" color={theme.inkMuted}>
        {label}
      </Typography>
      <Typography variant="label-md" style={{ flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Typography>
    </View>
  );
}
