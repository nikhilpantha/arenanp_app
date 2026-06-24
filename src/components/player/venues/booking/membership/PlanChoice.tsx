import { Pressable, View } from 'react-native';

import { Badge, Icon, Typography } from '@/components/common';
import { DURATION_LABEL } from '@/data/memberships';
import { useTheme } from '@/hooks/use-theme';
import type { MembershipPlan } from '@/lib/api/subscriptions';
import { cadenceLabel, sessionLengthLabel } from '@/lib/subscription-format';

/** Radio-card list of the venue's membership plans. */
export function PlanChoice({
  plans,
  selectedId,
  onSelect,
}: {
  plans: MembershipPlan[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();

  if (plans.length === 0) {
    return (
      <Typography variant="body-md" color={theme.inkMuted}>
        This venue has no membership plans yet.
      </Typography>
    );
  }

  return (
    <View className="gap-sm">
      <Typography variant="label-lg">Choose a plan</Typography>
      {plans.map((plan) => {
        const active = plan.id === selectedId;
        return (
          <Pressable
            key={plan.id}
            onPress={() => onSelect(plan.id)}
            className="gap-xs rounded-2xl p-md"
            style={{
              backgroundColor: active ? `${theme.primary}14` : theme.card,
              borderWidth: 1,
              borderColor: active ? theme.primary : theme.border,
            }}>
            <View className="flex-row items-start justify-between gap-md">
              <View className="flex-1 gap-xs">
                <Typography variant="label-lg" numberOfLines={1}>
                  {plan.name}
                </Typography>
                {plan.highlight ? <Badge variant="info">{plan.highlight}</Badge> : null}
              </View>
              <View className="flex-row items-baseline gap-[2px]">
                <Typography variant="label-lg" color={theme.primary}>
                  Rs {plan.price}
                </Typography>
                <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                  /{DURATION_LABEL[plan.duration]}
                </Typography>
              </View>
            </View>
            <View className="flex-row items-center gap-xs">
              <Icon name={active ? 'check' : 'repeat'} size={14} color={active ? theme.primary : theme.inkMuted} />
              <Typography variant="body-md" color={theme.inkMuted}>
                {sessionLengthLabel(plan.sessionMinutes)} · {cadenceLabel(plan.daysOfWeek)}
              </Typography>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
