import { View } from 'react-native';

import { Badge, Card, Typography } from '@/components/common';
import { DURATION_LABEL } from '@/data/memberships';
import { useTheme } from '@/hooks/use-theme';
import type { MembershipPlan } from '@/lib/api/subscriptions';
import { cadenceLabel, formatTime, sessionLengthLabel } from '@/lib/subscription-format';

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * The venue's active membership plans, shown to players on the detail screen. Each plan
 * mirrors the owner-side plan summary: name + price/duration header, then the session,
 * cadence, time bands and sports it covers. Renders nothing when there are no plans.
 */
export function VenueMemberships({ plans }: { plans: MembershipPlan[] }) {
  if (plans.length === 0) return null;

  return (
    <View className="gap-sm">
      <Typography variant="label-lg">Memberships</Typography>
      <View className="gap-md">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </View>
    </View>
  );
}

function PlanCard({ plan }: { plan: MembershipPlan }) {
  const theme = useTheme();
  const bands = plan.windows.map((w) => `${formatTime(w.start)} – ${formatTime(w.end)}`).join(', ');
  const sports = plan.sports.map(cap).join(', ') || '—';

  const rows = [
    { label: 'Session', value: sessionLengthLabel(plan.sessionMinutes) },
    { label: 'Days', value: cadenceLabel(plan.daysOfWeek) },
    { label: 'Time bands', value: bands || '—' },
    { label: 'Sports', value: sports },
  ];

  return (
    <Card elevation="sm" className="gap-sm">
      <View className="flex-row items-start justify-between gap-md">
        <View className="flex-1 gap-xs">
          <Typography variant="label-lg" numberOfLines={1}>
            {plan.name}
          </Typography>
          {plan.highlight ? <Badge variant="info">{plan.highlight}</Badge> : null}
        </View>
        <Typography variant="headline-md" color={theme.primary}>
          Rs {plan.price}
          <Typography variant="label-sm" color={theme.inkMuted}>
            {' '}
            / {DURATION_LABEL[plan.duration]}
          </Typography>
        </Typography>
      </View>

      {plan.description ? (
        <Typography variant="body-md" color={theme.inkMuted}>
          {plan.description}
        </Typography>
      ) : null}

      <View className="gap-xs pt-xs">
        {rows.map((row) => (
          <View key={row.label} className="flex-row items-start justify-between gap-md">
            <Typography variant="body-md" color={theme.inkMuted}>
              {row.label}
            </Typography>
            <Typography variant="label-md" style={{ flexShrink: 1, textAlign: 'right' }}>
              {row.value}
            </Typography>
          </View>
        ))}
      </View>
    </Card>
  );
}
