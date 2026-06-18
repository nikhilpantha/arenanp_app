import { View } from 'react-native';

import { Button, FormScreen, ScreenHeader, Typography } from '@/components/common';
import {
  FormDayPicker,
  FormDurationChips,
  FormInput,
  FormSessionLength,
  FormSportChips,
  FormWindowsEditor,
} from '@/components/form';
import { useTheme } from '@/hooks/use-theme';
import type { CreatePlanVars } from '@/lib/api/subscriptions';
import { useYupForm } from '@/lib/forms';
import { type MembershipPlanFormValues, membershipPlanSchema } from '@/lib/membership-schemas';
import type { SportType } from '@/types';

/** Defaults for a fresh plan: 1-hour sessions in a single morning band. */
export const PLAN_FORM_DEFAULTS: MembershipPlanFormValues = {
  name: '',
  price: undefined as unknown as number,
  duration: 'monthly',
  sessionMinutes: 60,
  sports: [],
  daysOfWeek: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
  windows: [{ start: '06:00', end: '08:00' }],
};

/**
 * Shared membership-plan form (create + edit). Validates with Yup + React Hook Form,
 * then hands the mapped plan payload to `onSubmit`.
 */
export function PlanForm({
  title,
  submitLabel,
  defaultValues,
  submitting,
  onSubmit,
  onBack,
}: {
  title: string;
  submitLabel: string;
  defaultValues: MembershipPlanFormValues;
  submitting: boolean;
  onSubmit: (vars: CreatePlanVars) => void;
  onBack: () => void;
}) {
  const theme = useTheme();
  const form = useYupForm<typeof membershipPlanSchema>({
    schema: membershipPlanSchema,
    defaultValues,
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit((values: MembershipPlanFormValues) => {
    onSubmit({
      name: values.name,
      price: values.price,
      duration: values.duration,
      sessionMinutes: values.sessionMinutes,
      windows: values.windows,
      daysOfWeek: values.daysOfWeek,
      sports: values.sports as SportType[],
    });
  });

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title={title} onBack={onBack} />}
      footer={
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          rightIcon="check"
          loading={submitting}
          onPress={submit}>
          {submitLabel}
        </Button>
      }>
      <View className="gap-md pt-md">
        <FormInput
          control={form.control}
          name="name"
          label="Plan name"
          placeholder="e.g. Morning Saver"
          leftIcon="award"
          autoCapitalize="words"
        />
        <FormInput
          control={form.control}
          name="price"
          label="Price (NPR)"
          placeholder="e.g. 4000"
          leftIcon="dollarSign"
          keyboardType="number-pad"
        />
      </View>

      <Field label="Billing cycle" error={errors.duration?.message} theme={theme}>
        <FormDurationChips control={form.control} name="duration" />
      </Field>

      <Field label="Session length" error={errors.sessionMinutes?.message} theme={theme}>
        <FormSessionLength control={form.control} name="sessionMinutes" />
      </Field>

      <Field label="Sports included" error={errors.sports?.message} theme={theme}>
        <FormSportChips control={form.control} name="sports" />
      </Field>

      <Field label="Days" error={errors.daysOfWeek?.message} theme={theme}>
        <FormDayPicker control={form.control} name="daysOfWeek" />
      </Field>

      <Field
        label="Membership time bands"
        hint="The times you'll give to memberships — the rest of the day stays open for normal bookings."
        error={typeof errors.windows?.message === 'string' ? errors.windows.message : undefined}
        theme={theme}>
        <FormWindowsEditor control={form.control} name="windows" />
      </Field>
    </FormScreen>
  );
}

/** Labelled section with an optional hint + inline validation error. */
function Field({
  label,
  hint,
  error,
  theme,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  theme: ReturnType<typeof useTheme>;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-sm pt-lg">
      <Typography variant="label-md" color={theme.inkMuted}>
        {label}
      </Typography>
      {hint ? (
        <Typography variant="body-md" color={theme.inkMuted}>
          {hint}
        </Typography>
      ) : null}
      {children}
      {error ? (
        <Typography variant="body-md" color={theme.danger}>
          {error}
        </Typography>
      ) : null}
    </View>
  );
}
