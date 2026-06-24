import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as yup from 'yup';

import { useToast } from '@/components/common';
import { useVenueDetail } from '@/lib/api/discovery';
import { useCourtTakenSlots, useCreateMySubscription } from '@/lib/api/player-subscriptions';
import { useVenueMembershipPlans } from '@/lib/api/subscriptions';
import { cadenceLabel, shortDate, slotLabel, slotOptions } from '@/lib/subscription-format';
import { todayIso } from '@/lib/time';

/** Validated on submit (the CTA is always enabled; errors surface above it). */
const membershipSchema = yup.object({
  planId: yup.string().required('Choose a membership plan.'),
  courtId: yup.string().required('Choose a court.'),
  slotStart: yup.string().required('Pick a daily time.'),
});

/** State + actions for the player membership-subscribe flow (plan → court → date → slot). */
export function usePlayerMembership() {
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ id: string; name?: string }>();
  const venueId = params.id;

  const venueQ = useVenueDetail(venueId);
  const plans = useVenueMembershipPlans(venueId).data ?? [];
  const courts = useMemo(() => venueQ.data?.courts ?? [], [venueQ.data]);

  const [planId, setPlanId] = useState<string | undefined>(undefined);
  const plan = plans.find((p) => p.id === planId);

  // Courts this plan covers (its sports), so the player only picks a valid surface.
  const eligibleCourts = useMemo(
    () => (plan ? courts.filter((c) => plan.sports.includes(c.sport.slug)) : []),
    [plan, courts],
  );

  const [pickedCourt, setPickedCourt] = useState<string | undefined>(undefined);
  const courtId = pickedCourt ?? (eligibleCourts.length === 1 ? eligibleCourts[0].id : undefined);

  const [date, setDate] = useState(() => todayIso());
  const [slotStart, setSlotStart] = useState('');

  // The membership's date range — slots taken on this court over it are unavailable.
  const startIso = useMemo(() => new Date(date).toISOString(), [date]);
  const endIso = useMemo(() => {
    if (!plan) return undefined;
    const d = new Date(date);
    d.setDate(d.getDate() + plan.validityDays);
    return d.toISOString();
  }, [date, plan]);
  const takenQ = useCourtTakenSlots(courtId, startIso, endIso);

  // Each allowed start time, flagged unavailable when already held on this court+range.
  const slots = useMemo(() => {
    if (!plan) return [] as { start: string; label: string; available: boolean }[];
    const taken = new Set(takenQ.data ?? []);
    return slotOptions(plan.windows, plan.sessionMinutes).map((s) => ({
      ...s,
      available: !taken.has(s.start),
    }));
  }, [plan, takenQ.data]);
  const freeCount = slots.filter((s) => s.available).length;
  const noneFree = !!courtId && slots.length > 0 && freeCount === 0;

  // Plan change → drop a court that the new plan doesn't cover.
  const [prevPlan, setPrevPlan] = useState('');
  if ((planId ?? '') !== prevPlan) {
    setPrevPlan(planId ?? '');
    if (pickedCourt && !eligibleCourts.some((c) => c.id === pickedCourt)) setPickedCourt(undefined);
  }

  // Keep the chosen slot on a free option as plan/court/date/availability change.
  useEffect(() => {
    const free = slots.filter((s) => s.available);
    setSlotStart((prev) =>
      free.length === 0 ? '' : free.some((s) => s.start === prev) ? prev : free[0].start,
    );
  }, [slots]);

  const subscribe = useCreateMySubscription();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const selectedFree = slots.some((s) => s.start === slotStart && s.available);
  const canSubscribe = !!plan && !!courtId && selectedFree;
  const totalLabel = plan ? `Rs ${plan.price}` : '';

  // CTA is always enabled — validate on press and surface Yup errors instead of disabling.
  const onSubmit = () => {
    try {
      membershipSchema.validateSync({ planId, courtId, slotStart }, { abortEarly: false });
      setErrors([]);
      setConfirmOpen(true);
    } catch (e) {
      setErrors(e instanceof yup.ValidationError ? e.errors : ['Please complete your membership.']);
    }
  };

  const submit = () => {
    if (!plan || !courtId || !slotStart) return;
    setSubmitError(null);
    subscribe.mutate(
      { venueId, planId: plan.id, courtId, slotStart, startDate: new Date(date).toISOString() },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          toast.success('Membership requested', `We'll notify you when the venue confirms`);
          router.replace('/my-games');
        },
        onError: (e) =>
          setSubmitError(e instanceof Error ? e.message : 'Could not subscribe. Please try again.'),
      },
    );
  };

  const reviewRows = plan
    ? [
        { label: 'Plan', value: plan.name },
        {
          label: 'Court',
          value: eligibleCourts.find((c) => c.id === courtId)?.name ?? '—',
        },
        { label: 'Days', value: cadenceLabel(plan.daysOfWeek) },
        { label: 'Time', value: slotStart ? slotLabel(slotStart, plan.sessionMinutes) : '—' },
        { label: 'Starts', value: shortDate(new Date(date).toISOString()) },
      ]
    : [];

  return {
    router,
    loading: venueQ.isLoading,
    plans,
    plan,
    onPlan: setPlanId,
    courts: eligibleCourts,
    courtId,
    onCourt: setPickedCourt,
    date,
    setDate,
    slots,
    slotStart,
    setSlotStart,
    slotsLoading: takenQ.isLoading,
    noneFree,
    canSubscribe,
    totalLabel,
    errors,
    onSubmit,
    confirm: {
      open: confirmOpen,
      close: () => {
        setConfirmOpen(false);
        setSubmitError(null);
      },
      submit,
      loading: subscribe.isPending,
      error: submitError,
      rows: reviewRows,
      totalLabel,
    },
  };
}
