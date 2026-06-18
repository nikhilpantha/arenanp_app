import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, FormScreen, ScreenHeader, Typography, useToast } from '@/components/common';
import { CustomerPicker, type PickedCustomer } from '@/components/venue/bookings/CustomerPicker';
import { DURATION_LABEL, MEMBERSHIP_TIERS } from '@/data/memberships';
import { useTheme } from '@/hooks/use-theme';
import { useYupForm, yup } from '@/lib/forms';

import { CustomerField, FieldError, RadioCard, Step, SummaryRow } from './subscribe-fields';

const mockSchema = yup.object({
  customerId: yup.string().required('Choose a customer for this membership.'),
  tierId: yup.string().required('Choose a membership plan.'),
});

const SET = { shouldValidate: true } as const;

/** Offline fallback (no API): pick a customer + plan, mock-confirm. Same form pattern. */
export function MockBook() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const form = useYupForm<typeof mockSchema>({
    schema: mockSchema,
    defaultValues: { customerId: '', tierId: '' },
  });
  const values = form.watch();
  const errors = form.formState.errors;
  const [customer, setCustomer] = useState<PickedCustomer | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const tier = MEMBERSHIP_TIERS.find((t) => t.id === values.tierId) ?? null;
  const totalLabel = tier ? `Rs ${tier.price}` : '—';

  const pickCustomer = (c: PickedCustomer) => {
    setCustomer(c);
    form.setValue('customerId', c.id, SET);
  };
  const submit = form.handleSubmit(() => {
    toast.success(`${customer?.name ?? ''} · ${tier?.name ?? ''}`, 'Membership booked');
    router.back();
  });

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title="New membership" onBack={() => router.back()} />}
      footer={
        <Button size="lg" fullWidth className="rounded-full" rightIcon="check" onPress={submit}>
          {`Confirm · ${totalLabel}`}
        </Button>
      }>
      <Step index={1} title="Customer" done={!!customer}>
        <CustomerField customer={customer} onOpenPicker={() => setPickerVisible(true)} />
        <FieldError message={errors.customerId?.message} />
      </Step>

      <Step index={2} title="Select the plan" done={!!tier}>
        {MEMBERSHIP_TIERS.map((t) => (
          <RadioCard
            key={t.id}
            title={t.name}
            meta={`Rs ${t.price} / ${DURATION_LABEL[t.duration]} · ${t.sportsIncluded.length} sports`}
            selected={t.id === values.tierId}
            onPress={() => form.setValue('tierId', t.id, SET)}
          />
        ))}
        <FieldError message={errors.tierId?.message} />
      </Step>

      {customer && tier ? (
        <View className="pt-lg">
          <Card elevation="sm" className="gap-sm">
            <Typography variant="label-md" color={theme.inkMuted}>
              Summary
            </Typography>
            <SummaryRow label="Customer" value={customer.name} />
            <SummaryRow label="Plan" value={tier.name} />
            <SummaryRow label="Price" value={`${totalLabel} / ${DURATION_LABEL[tier.duration]}`} />
          </Card>
        </View>
      ) : null}

      <CustomerPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={pickCustomer}
      />
    </FormScreen>
  );
}
