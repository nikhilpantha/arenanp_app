import { type ReactNode, useState } from 'react';
import { View } from 'react-native';

import { Button, FormScreen, ScreenHeader, Segmented, Typography } from '@/components/common';
import { FormInput, FormSportChips, FormTimeSelect } from '@/components/form';
import { useTheme } from '@/hooks/use-theme';
import { useYupForm } from '@/lib/forms';
import { type OfferFormValues, offerSchema } from '@/lib/offer-schemas';
import type { DayOfWeek, Offer, OfferAudience, OfferRewardKind, OfferTriggerKind, SportType } from '@/types';

export type OfferDraft = Omit<Offer, 'id' | 'status'>;

const REWARDS: { value: OfferRewardKind; label: string }[] = [
  { value: 'free-game', label: 'Free game' },
  { value: 'percent', label: '% off' },
  { value: 'flat', label: 'Rs off' },
];

const TRIGGERS: { value: OfferTriggerKind; label: string }[] = [
  { value: 'every-nth', label: 'Every Nth' },
  { value: 'happy-hour', label: 'Happy hour' },
  { value: 'manual', label: 'Manual' },
];

const AUDIENCES: { value: OfferAudience; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'individual', label: 'Players' },
  { value: 'team', label: 'Teams' },
  { value: 'member', label: 'Members' },
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

/** The offer builder body — shared by the create and edit screens. */
export function OfferForm({
  title,
  initial,
  submitLabel,
  onSubmit,
  onBack,
  below,
}: {
  title: string;
  initial?: Offer;
  submitLabel: string;
  onSubmit: (draft: OfferDraft) => void;
  onBack: () => void;
  below?: ReactNode;
}) {
  const theme = useTheme();

  const form = useYupForm<typeof offerSchema>({
    schema: offerSchema,
    defaultValues: {
      title: initial?.title ?? '',
      reward: initial?.reward ?? 'percent',
      rewardValue: initial?.rewardValue,
      trigger: initial?.trigger ?? 'every-nth',
      everyGames: initial?.everyGames,
      startTime: hourToTime(initial?.startHour ?? 6),
      closeTime: hourToTime(initial?.endHour ?? 10),
      sports: initial?.sports ?? [],
    },
  });

  const [days, setDays] = useState<DayOfWeek[]>(initial?.days ?? ['sun', 'mon', 'tue', 'wed', 'thu', 'fri']);
  const [audience, setAudience] = useState<OfferAudience>(initial?.audience ?? 'all');

  const reward = form.watch('reward');
  const trigger = form.watch('trigger');

  const toggleDay = (d: DayOfWeek) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const submit = form.handleSubmit((v: OfferFormValues) => {
    onSubmit({
      title: v.title,
      reward: v.reward,
      rewardValue: v.reward === 'free-game' ? undefined : Number(v.rewardValue),
      trigger: v.trigger,
      everyGames: v.trigger === 'every-nth' ? Number(v.everyGames) : undefined,
      days: v.trigger === 'happy-hour' ? days : undefined,
      startHour: v.trigger === 'happy-hour' ? timeToHour(v.startTime) : undefined,
      endHour: v.trigger === 'happy-hour' ? timeToHour(v.closeTime) : undefined,
      audience,
      sports: v.sports && v.sports.length ? (v.sports as SportType[]) : undefined,
    });
  });

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title={title} onBack={onBack} />}
      footer={
        <Button size="lg" fullWidth className="rounded-full" rightIcon="check" onPress={submit}>
          {submitLabel}
        </Button>
      }>
      <View className="pt-md">
        <FormInput
          control={form.control}
          name="title"
          label="Offer title"
          placeholder="e.g. Loyalty card"
          leftIcon="award"
          autoCapitalize="words"
        />
      </View>

      {/* Reward */}
      <Field label="Reward">
        <Segmented options={REWARDS} value={reward} onChange={(v) => form.setValue('reward', v as OfferRewardKind, { shouldValidate: true })} />
        {reward !== 'free-game' ? (
          <FormInput
            control={form.control}
            name="rewardValue"
            label={reward === 'percent' ? 'Percent off' : 'Amount off (NPR)'}
            placeholder={reward === 'percent' ? 'e.g. 20' : 'e.g. 200'}
            leftIcon={reward === 'percent' ? 'percent' : 'dollarSign'}
            keyboardType="number-pad"
          />
        ) : null}
      </Field>

      {/* Trigger */}
      <Field label="When it applies">
        <Segmented options={TRIGGERS} value={trigger} onChange={(v) => form.setValue('trigger', v as OfferTriggerKind, { shouldValidate: true })} />

        {trigger === 'every-nth' ? (
          <FormInput
            control={form.control}
            name="everyGames"
            label="Reward every N games"
            placeholder="e.g. 10"
            leftIcon="repeat"
            keyboardType="number-pad"
          />
        ) : null}

        {trigger === 'happy-hour' ? (
          <View className="gap-md">
            <View className="gap-sm">
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
            <View className="flex-row gap-md">
              <View className="flex-1">
                <FormTimeSelect control={form.control} name="startTime" label="From" />
              </View>
              <View className="flex-1">
                <FormTimeSelect control={form.control} name="closeTime" label="To" />
              </View>
            </View>
          </View>
        ) : null}

        {trigger === 'manual' ? (
          <Typography variant="body-md" color={theme.inkMuted}>
            You&apos;ll grant this offer to a customer or team from their screen.
          </Typography>
        ) : null}
      </Field>

      {/* Scope */}
      <Field label="Who can use it">
        <Segmented options={AUDIENCES} value={audience} onChange={(v) => setAudience(v as OfferAudience)} />
      </Field>

      <Field label="Sports (all if none picked)">
        <FormSportChips control={form.control} name="sports" />
      </Field>

      {below}
    </FormScreen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View className="gap-sm pt-lg">
      <Typography variant="label-md" color={theme.inkMuted}>
        {label}
      </Typography>
      {children}
    </View>
  );
}

const hourToTime = (h: number): string => `${String(h).padStart(2, '0')}:00`;
const timeToHour = (t: string): number => Number(t.split(':')[0]);
