import { useRouter } from 'expo-router';

import { useToast } from '@/components/common';
import { PLAN_FORM_DEFAULTS, PlanForm } from '@/components/venue/bookings/PlanForm';
import { useCreateMembershipPlan } from '@/lib/api/subscriptions';

export default function NewMembershipPlan() {
  const router = useRouter();
  const toast = useToast();
  const createPlan = useCreateMembershipPlan();

  return (
    <PlanForm
      title="New plan"
      submitLabel="Create plan"
      defaultValues={PLAN_FORM_DEFAULTS}
      submitting={createPlan.isPending}
      onBack={() => router.back()}
      onSubmit={async (vars) => {
        try {
          await createPlan.mutateAsync(vars);
          toast.success(`${vars.name} is now available to subscribe.`, 'Plan created');
          router.back();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Please try again.', "Couldn't create plan");
        }
      }}
    />
  );
}
