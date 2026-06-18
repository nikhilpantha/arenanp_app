import { View } from 'react-native';

import { DateStrip, TimeSelect, Typography } from '@/components/common';
import { FormInput } from '@/components/form';
import { RadioCard, Step } from '@/components/venue/bookings/subscribe/subscribe-fields';
import type { useClosureForm } from '@/components/venue/closures/use-closure-form';
import { useTheme } from '@/hooks/use-theme';

type Form = ReturnType<typeof useClosureForm>;

/** Scope step: block the whole venue or a single court (then pick the court). */
export function ScopeStep({ form }: { form: Form }) {
  const { values, courts, selectScope, selectCourt } = form;
  const error = form.form.formState.errors.courtId?.message;
  return (
    <Step index={1} title="What to close" done={values.scope === 'venue' || !!values.courtId}>
      <View className="gap-sm">
        <RadioCard
          title="Whole venue"
          meta="Blocks every court — use for a full closure"
          selected={values.scope === 'venue'}
          onPress={() => selectScope('venue')}
        />
        <RadioCard
          title="A single court"
          meta="Block just one court; the rest stay bookable"
          selected={values.scope === 'court'}
          onPress={() => selectScope('court')}
        />
      </View>

      {values.scope === 'court' ? (
        <View className="gap-sm pt-sm">
          {courts.map((c) => (
            <RadioCard
              key={c.id}
              title={c.name}
              meta={c.sportLabel}
              selected={values.courtId === c.id}
              onPress={() => selectCourt(c.id)}
            />
          ))}
          {courts.length === 0 ? <FieldText text="This venue has no courts yet." /> : null}
          {error ? <FieldText text={error} danger /> : null}
        </View>
      ) : null}
    </Step>
  );
}

/** Start + end date/time pickers (unified range — covers a few hours or several days). */
export function WhenStep({ form }: { form: Form }) {
  const { values, setField } = form;
  const errors = form.form.formState.errors;
  return (
    <Step index={2} title="When" done={!!values.startDate && !!values.endDate}>
      <RangeRow
        label="Starts"
        date={values.startDate}
        time={values.startTime}
        onDate={(d) => setField('startDate', d)}
        onTime={(t) => setField('startTime', t)}
      />
      <RangeRow
        label="Ends"
        date={values.endDate}
        time={values.endTime}
        onDate={(d) => setField('endDate', d)}
        onTime={(t) => setField('endTime', t)}
      />
      {errors.endTime?.message ? <FieldText text={errors.endTime.message} danger /> : null}
    </Step>
  );
}

/** Optional reason shown to players (e.g. "Maintenance"). */
export function ReasonStep({ form }: { form: Form }) {
  return (
    <Step index={3} title="Reason (optional)" done={false}>
      <FormInput
        control={form.form.control}
        name="reason"
        placeholder="e.g. Maintenance, private event, Dashain"
      />
    </Step>
  );
}

function RangeRow({
  label,
  date,
  time,
  onDate,
  onTime,
}: {
  label: string;
  date: string;
  time: string;
  onDate: (d: string) => void;
  onTime: (t: string) => void;
}) {
  const theme = useTheme();
  return (
    <View className="gap-sm pt-sm">
      <Typography variant="label-md" color={theme.inkMuted}>
        {label}
      </Typography>
      <DateStrip value={date} onChange={onDate} count={30} />
      <View className="flex-row">
        <TimeSelect value={time} onChange={onTime} />
      </View>
    </View>
  );
}

function FieldText({ text, danger }: { text: string; danger?: boolean }) {
  const theme = useTheme();
  return (
    <Typography variant="body-md" color={danger ? theme.danger : theme.inkMuted}>
      {text}
    </Typography>
  );
}
