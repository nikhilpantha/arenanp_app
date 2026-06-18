import { useRouter } from 'expo-router';

import { useToast } from '@/components/common';
import { useCreateClosure } from '@/lib/api/closures';
import { useVenueCourts } from '@/lib/api/venue-bookings';
import { nepalWallToUtcISO } from '@/lib/closure-format';
import { closureSchema } from '@/lib/closure-schemas';
import { useYupForm } from '@/lib/forms';

const SET = { shouldValidate: true, shouldDirty: true } as const;
const RESET = { shouldValidate: false } as const;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Data, form (RHF + Yup) and submit logic for the block-time / close-venue screen. */
export function useClosureForm() {
  const router = useRouter();
  const toast = useToast();
  const courtsQ = useVenueCourts();
  const createClosure = useCreateClosure();

  const form = useYupForm<typeof closureSchema>({
    schema: closureSchema,
    defaultValues: {
      scope: 'venue',
      courtId: '',
      startDate: todayIso(),
      startTime: '06:00',
      endDate: todayIso(),
      endTime: '22:00',
      reason: '',
    },
  });
  const values = form.watch();
  const courts = courtsQ.data ?? [];

  const selectScope = (scope: 'court' | 'venue') => {
    form.setValue('scope', scope, SET);
    if (scope === 'venue') {
      form.setValue('courtId', '', RESET);
      form.clearErrors('courtId');
    }
  };
  const selectCourt = (id: string) => form.setValue('courtId', id, SET);
  const setField = (name: 'startDate' | 'startTime' | 'endDate' | 'endTime', v: string) =>
    form.setValue(name, v, SET);

  const submit = form.handleSubmit(async (v) => {
    try {
      await createClosure.mutateAsync({
        courtId: v.scope === 'court' ? v.courtId : undefined,
        startAt: nepalWallToUtcISO(v.startDate, v.startTime),
        endAt: nepalWallToUtcISO(v.endDate, v.endTime),
        reason: v.reason?.trim() || undefined,
      });
      toast.success(
        v.scope === 'venue' ? 'Venue closed for the selected time' : 'Court blocked',
        'Block added',
      );
      router.back();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Please try again.', "Couldn't add block");
    }
  });

  return {
    form,
    values,
    courts,
    selectScope,
    selectCourt,
    setField,
    submit,
    submitting: createClosure.isPending,
  };
}
