import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormScreen, ScreenHeader, Segmented, Typography } from '@/components/common';
import { FormInput, FormSportChips, FormTimeSelect } from '@/components/form';
import { useTheme } from '@/hooks/use-theme';
import { useYupForm } from '@/lib/forms';
import { type MembershipPlanFormValues,membershipPlanSchema } from '@/lib/membership-schemas';
import type { DayOfWeek, MembershipDuration } from '@/types';

const DURATIONS: { value: MembershipDuration; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: '3 mo' },
  { value: 'half-yearly', label: '6 mo' },
  { value: 'yearly', label: 'Yearly' },
];

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'sun', label: 'S' },
  { value: 'mon', label: 'M' },
  { value: 'tue', label: 'T' },
  { value: 'wed', label: 'W' },
  { value: 'thu', label: 'T' },
  { value: 'fri', label: 'F' },
  { value: 'sat', label: 'S' },
];

export default function NewMembershipPlan() {
  const theme = useTheme();
  const router = useRouter();

  const form = useYupForm<typeof membershipPlanSchema>({
    schema: membershipPlanSchema,
    defaultValues: { name: '', price: undefined, sports: [], openTime: '06:00', closeTime: '22:00' },
  });

  const [duration, setDuration] = useState<MembershipDuration>('monthly');
  const [days, setDays] = useState<DayOfWeek[]>(['sun', 'mon', 'tue', 'wed', 'thu', 'fri']);

  const toggleDay = (d: DayOfWeek) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const onSubmit = form.handleSubmit((_values: MembershipPlanFormValues) => {
    // TODO(backend): persist the plan. Frontend-only for now.
    Alert.alert('Plan created', undefined, [{ text: 'Done', onPress: () => router.back() }]);
  });

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title="New plan" onBack={() => router.back()} />}
      footer={
        <Button size="lg" fullWidth className="rounded-full" rightIcon="check" onPress={onSubmit}>
          Create plan
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

      <View className="gap-sm pt-lg">
        <Typography variant="label-md" color={theme.inkMuted}>
          Duration
        </Typography>
        <Segmented
          options={DURATIONS}
          value={duration}
          onChange={(v) => setDuration(v as MembershipDuration)}
        />
      </View>

      <View className="gap-sm pt-lg">
        <Typography variant="label-md" color={theme.inkMuted}>
          Sports included
        </Typography>
        <FormSportChips control={form.control} name="sports" />
      </View>

      <View className="gap-sm pt-lg">
        <Typography variant="label-md" color={theme.inkMuted}>
          Days
        </Typography>
        <View className="flex-row gap-xs">
          {DAYS.map((d, i) => {
            const active = days.includes(d.value);
            return (
              <Button
                key={`${d.value}-${i}`}
                variant={active ? 'primary' : 'tertiary'}
                size="md"
                className="flex-1"
                onPress={() => toggleDay(d.value)}>
                {d.label}
              </Button>
            );
          })}
        </View>
      </View>

      <View className="flex-row gap-md pt-lg">
        <View className="flex-1">
          <FormTimeSelect control={form.control} name="openTime" label="From" />
        </View>
        <View className="flex-1">
          <FormTimeSelect control={form.control} name="closeTime" label="To" />
        </View>
      </View>
    </FormScreen>
  );
}
