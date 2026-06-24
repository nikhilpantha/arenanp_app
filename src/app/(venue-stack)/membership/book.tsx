import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  Button,
  Card,
  DateStrip,
  FormScreen,
  InlineLoader,
  ScreenHeader,
  Typography,
} from '@/components/common';
import { BookingsEmptyState } from '@/components/venue/bookings/BookingsEmptyState';
import { CustomerPicker } from '@/components/venue/bookings/CustomerPicker';
import { MockBook } from '@/components/venue/bookings/subscribe/MockBook';
import {
  CustomerField,
  FieldError,
  RadioCard,
  Step,
  SummaryRow,
} from '@/components/venue/bookings/subscribe/subscribe-fields';
import { useBookSubscription } from '@/components/venue/bookings/subscribe/use-book-subscription';
import { DURATION_LABEL } from '@/data/memberships';
import { useTheme } from '@/hooks/use-theme';
import { useSubscriptionsApiEnabled } from '@/lib/api/subscriptions';
import { sessionLengthLabel, slotLabel } from '@/lib/subscription-format';

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * Subscribe a customer to a membership plan. Live path uses RHF + Yup (inline errors);
 * the offline fallback ({@link MockBook}) follows the same form pattern.
 */
export default function BookMembershipScreen() {
  const apiEnabled = useSubscriptionsApiEnabled();
  return apiEnabled ? <LiveBook /> : <MockBook />;
}

function LiveBook() {
  const theme = useTheme();
  const router = useRouter();
  const b = useBookSubscription();
  const { form, values, customer, plan, plans, plansQ, courts, slots, takenStarts } = b;
  const { errors } = form.formState;
  const totalLabel = plan ? `Rs ${plan.price}` : '—';
  const [pickerVisible, setPickerVisible] = useState(false);
  const startLabel = new Date(`${values.startDate}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title="New membership" onBack={() => router.back()} />}
      footer={
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          rightIcon="check"
          loading={b.submitting}
          onPress={b.submit}>
          {`Confirm · ${totalLabel}`}
        </Button>
      }>
      <Step index={1} title="Customer" done={!!customer}>
        <CustomerField customer={customer} onOpenPicker={() => setPickerVisible(true)} />
        <FieldError message={errors.customerId?.message} />
      </Step>

      <Step index={2} title="Select the plan" done={!!plan}>
        {plansQ.isLoading ? (
          <InlineLoader />
        ) : plansQ.isError ? (
          <BookingsEmptyState
            label="Couldn't load plans"
            hint={plansQ.error instanceof Error ? plansQ.error.message : 'Try again.'}
          />
        ) : plans.length === 0 ? (
          <BookingsEmptyState
            icon="award"
            label="No active plans"
            hint="Create a membership plan before subscribing a customer."
            actionLabel="Create a plan"
            onAction={() => router.push('/membership/new')}
          />
        ) : (
          plans.map((p) => (
            <RadioCard
              key={p.id}
              title={p.name}
              meta={`Rs ${p.price} / ${DURATION_LABEL[p.duration]} · ${sessionLengthLabel(p.sessionMinutes)}/day`}
              selected={p.id === values.planId}
              onPress={() => b.selectPlan(p.id)}
            />
          ))
        )}
        <FieldError message={errors.planId?.message} />
      </Step>

      {plan ? (
        <Step index={3} title="Court" done={!!values.courtId}>
          {courts.length === 0 ? (
            <Typography variant="body-md" color={theme.inkMuted}>
              No court offers this plan&apos;s sports.
            </Typography>
          ) : (
            courts.map((c) => (
              <RadioCard
                key={c.id}
                title={c.name}
                meta={cap(c.sportSlug)}
                selected={c.id === values.courtId}
                onPress={() => b.selectCourt(c.id)}
              />
            ))
          )}
          <FieldError message={errors.courtId?.message} />
        </Step>
      ) : null}

      {plan ? (
        <Step index={4} title="Start date" done>
          <DateStrip value={values.startDate} onChange={b.setStartDate} count={60} />
        </Step>
      ) : null}

      {plan && values.courtId ? (
        <Step index={5} title="Daily time slot" done={!!values.slotStart}>
          {slots.length === 0 ? (
            <Typography variant="body-md" color={theme.inkMuted}>
              This plan has no bookable slots — check its time bands.
            </Typography>
          ) : (
            <View className="flex-row flex-wrap gap-sm">
              {slots.map((s) => {
                const taken = takenStarts.has(s.start);
                return (
                  <Button
                    key={s.start}
                    variant={values.slotStart === s.start ? 'primary' : 'tertiary'}
                    size="md"
                    style={{ width: '48%' }}
                    disabled={taken}
                    onPress={() => b.setSlot(s.start)}>
                    {taken ? `${s.label} · Booked` : s.label}
                  </Button>
                );
              })}
            </View>
          )}
          <FieldError message={errors.slotStart?.message} />
        </Step>
      ) : null}

      {customer && plan && values.courtId && values.slotStart ? (
        <View className="pt-lg">
          <Card elevation="sm" className="gap-sm">
            <Typography variant="label-md" color={theme.inkMuted}>
              Summary
            </Typography>
            <SummaryRow label="Customer" value={customer.name} />
            <SummaryRow label="Plan" value={plan.name} />
            <SummaryRow
              label="Court"
              value={courts.find((c) => c.id === values.courtId)?.name ?? '—'}
            />
            <SummaryRow label="Daily slot" value={slotLabel(values.slotStart, plan.sessionMinutes)} />
            <SummaryRow label="Starts" value={startLabel} />
            <SummaryRow label="Price" value={`${totalLabel} / ${DURATION_LABEL[plan.duration]}`} />
          </Card>
        </View>
      ) : null}

      <CustomerPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={b.pickCustomer}
      />
    </FormScreen>
  );
}
