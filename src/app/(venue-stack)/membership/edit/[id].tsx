import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { InlineLoader, Screen, ScreenHeader, Typography, useToast } from '@/components/common';
import { PlanForm } from '@/components/venue/bookings/PlanForm';
import { useTheme } from '@/hooks/use-theme';
import { useMembershipPlans, useUpdateMembershipPlan } from '@/lib/api/subscriptions';
import type { MembershipPlanFormValues } from '@/lib/membership-schemas';

export default function EditMembershipPlan() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();

  const plansQ = useMembershipPlans();
  const updatePlan = useUpdateMembershipPlan();
  const plan = plansQ.data?.find((p) => p.id === id);

  if (plansQ.isLoading) {
    return (
      <Screen scroll>
        <View className="pt-sm">
          <ScreenHeader title="Edit plan" onBack={() => router.back()} />
        </View>
        <InlineLoader paddingVertical={48} />
      </Screen>
    );
  }

  if (!plan) {
    return (
      <Screen scroll>
        <View className="pt-sm">
          <ScreenHeader title="Edit plan" onBack={() => router.back()} />
        </View>
        <Typography variant="body-md" color={theme.inkMuted} style={{ paddingTop: 16 }}>
          Plan not found.
        </Typography>
      </Screen>
    );
  }

  const defaults: MembershipPlanFormValues = {
    name: plan.name,
    price: plan.price,
    duration: plan.duration,
    sessionMinutes: plan.sessionMinutes,
    sports: plan.sports,
    daysOfWeek: plan.daysOfWeek,
    windows: plan.windows,
  };

  return (
    <PlanForm
      title="Edit plan"
      submitLabel="Save changes"
      defaultValues={defaults}
      submitting={updatePlan.isPending}
      onBack={() => router.back()}
      onSubmit={async (vars) => {
        try {
          await updatePlan.mutateAsync({ ...vars, planId: plan.id });
          toast.success(`${vars.name} updated.`, 'Plan saved');
          router.back();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Please try again.', "Couldn't save plan");
        }
      }}
    />
  );
}
