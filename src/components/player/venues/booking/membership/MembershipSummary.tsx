import { View } from 'react-native';

import { Card, Icon, Typography } from '@/components/common';
import { DURATION_LABEL } from '@/data/memberships';
import { useTheme } from '@/hooks/use-theme';
import type { MembershipPlan } from '@/lib/api/subscriptions';
import { shortDate } from '@/lib/subscription-format';

/** Membership price + validity window + the pay-at-venue note. */
export function MembershipSummary({ plan, date }: { plan: MembershipPlan; date: string }) {
  const theme = useTheme();
  const expiry = new Date(date);
  expiry.setDate(expiry.getDate() + plan.validityDays);

  return (
    <Card elevation="sm" className="gap-sm">
      <View className="flex-row items-center justify-between">
        <Typography variant="label-lg" numberOfLines={1} style={{ flex: 1 }}>
          {plan.name}
        </Typography>
        <View className="flex-row items-baseline gap-[2px]">
          <Typography variant="label-lg" color={theme.primary}>
            Rs {plan.price}
          </Typography>
          <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
            /{DURATION_LABEL[plan.duration]}
          </Typography>
        </View>
      </View>
      <View className="flex-row items-center justify-between border-t pt-sm" style={{ borderColor: theme.border }}>
        <Typography variant="body-md" color={theme.inkMuted}>
          Valid till
        </Typography>
        <Typography variant="label-md">{shortDate(expiry.toISOString())}</Typography>
      </View>
      <View className="mt-xs flex-row items-start gap-sm">
        <Icon name="building" size={14} color={theme.inkMuted} />
        <Typography variant="label-sm" color={theme.inkMuted} style={{ flex: 1, textTransform: 'none' }}>
          Pay at the venue — your membership activates on the start date.
        </Typography>
      </View>
    </Card>
  );
}
