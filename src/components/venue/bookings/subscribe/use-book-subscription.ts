import { useState } from 'react';
import { useRouter } from 'expo-router';

import { useToast } from '@/components/common';
import type { PickedCustomer } from '@/components/venue/bookings/CustomerPicker';
import {
  useCreateSubscription,
  useMembershipPlans,
  useVenueSubscriptions,
} from '@/lib/api/subscriptions';
import { useVenueCourts } from '@/lib/api/venue-bookings';
import { useYupForm } from '@/lib/forms';
import { subscriptionBookSchema } from '@/lib/membership-schemas';
import { slotOptions } from '@/lib/subscription-format';

const SET = { shouldValidate: true, shouldDirty: true } as const;
// Clearing a dependent field must NOT validate it — otherwise picking a plan would
// immediately flag the not-yet-touched court / slot as errors.
const RESET = { shouldValidate: false } as const;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Data, form (RHF + Yup) and submit logic for the subscribe-a-customer screen. */
export function useBookSubscription() {
  const router = useRouter();
  const toast = useToast();
  const plansQ = useMembershipPlans(true);
  const courtsQ = useVenueCourts();
  const subsQ = useVenueSubscriptions();
  const createSub = useCreateSubscription();

  const form = useYupForm<typeof subscriptionBookSchema>({
    schema: subscriptionBookSchema,
    defaultValues: { customerId: '', planId: '', courtId: '', startDate: todayIso(), slotStart: '' },
  });
  const [customer, setCustomer] = useState<PickedCustomer | null>(null);
  const values = form.watch();

  const plans = plansQ.data ?? [];
  const plan = plans.find((p) => p.id === values.planId) ?? null;
  const courts = (courtsQ.data ?? []).filter((c) => !plan || plan.sports.includes(c.sportSlug));
  const slots = plan ? slotOptions(plan.windows, plan.sessionMinutes) : [];

  // Slots already held on the chosen court whose dates overlap this subscription's range.
  const rangeStart = new Date(values.startDate);
  const rangeEnd = new Date(values.startDate);
  rangeEnd.setDate(rangeEnd.getDate() + (plan?.validityDays ?? 0));
  const takenStarts = new Set(
    (subsQ.data ?? [])
      .filter(
        (s) =>
          s.courtId === values.courtId &&
          (s.status === 'active' || s.status === 'paused' || s.status === 'scheduled') &&
          new Date(s.startedAt) <= rangeEnd &&
          new Date(s.expiresAt) >= rangeStart,
      )
      .map((s) => s.slotStart),
  );

  const pickCustomer = (c: PickedCustomer) => {
    setCustomer(c);
    form.setValue('customerId', c.id, SET);
  };
  const selectPlan = (id: string) => {
    form.setValue('planId', id, SET);
    form.setValue('courtId', '', RESET); // courts are filtered by the plan's sports
    form.setValue('slotStart', '', RESET);
    form.clearErrors(['courtId', 'slotStart']);
  };
  const selectCourt = (id: string) => {
    form.setValue('courtId', id, SET);
    form.setValue('slotStart', '', RESET); // availability depends on the court
    form.clearErrors('slotStart');
  };
  const setStartDate = (d: string) => form.setValue('startDate', d, SET);
  const setSlot = (s: string) => form.setValue('slotStart', s, SET);

  const submit = form.handleSubmit(async (v) => {
    try {
      await createSub.mutateAsync({
        customerId: v.customerId,
        planId: v.planId,
        courtId: v.courtId,
        slotStart: v.slotStart,
        startDate: new Date(v.startDate).toISOString(),
      });
      toast.success(`${customer?.name ?? 'Customer'} · ${plan?.name ?? ''}`, 'Membership booked');
      router.back();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Please try again.', "Couldn't subscribe");
    }
  });

  return {
    form,
    values,
    customer,
    plan,
    plans,
    plansQ,
    courts,
    slots,
    takenStarts,
    pickCustomer,
    selectPlan,
    selectCourt,
    setStartDate,
    setSlot,
    submit,
    submitting: createSub.isPending,
  };
}
