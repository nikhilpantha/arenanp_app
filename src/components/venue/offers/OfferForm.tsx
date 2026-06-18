import { type ReactNode, useState } from 'react';
import { View } from 'react-native';

import { Button, FormScreen, ScreenHeader, Segmented, Typography } from '@/components/common';
import { FormInput } from '@/components/form';
import { useTheme } from '@/hooks/use-theme';
import type { ApiOfferAudience, ApiOfferDiscountType, ApiOfferTrigger } from '@/lib/api/operations';
import type { VenueOffer, VenueOfferDraft } from '@/lib/api/venue-offers';
import { useYupForm } from '@/lib/forms';
import { type OfferFormValues, offerSchema } from '@/lib/offer-schemas';

const TRIGGERS: { value: ApiOfferTrigger; label: string }[] = [
  { value: 'EVERY_NTH', label: 'Loyalty' },
  { value: 'PROMO_CODE', label: 'Promo code' },
];

const LOYALTY_REWARDS: { value: ApiOfferDiscountType; label: string }[] = [
  { value: 'FREE_GAME', label: 'Free game' },
  { value: 'PERCENT', label: '% off' },
  { value: 'FLAT', label: 'Rs off' },
];
const PROMO_REWARDS: { value: ApiOfferDiscountType; label: string }[] = [
  { value: 'PERCENT', label: '% off' },
  { value: 'FLAT', label: 'Rs off' },
];

const AUDIENCES: { value: ApiOfferAudience; label: string }[] = [
  { value: 'ALL', label: 'Everyone' },
  { value: 'INDIVIDUAL', label: 'Players' },
  { value: 'TEAM', label: 'Teams' },
];

/** One year from now, so a venue's offer doesn't silently expire. */
function defaultValidUntil(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

/** The offer builder body — shared by the create and edit screens (backend model). */
export function OfferForm({
  title,
  initial,
  submitLabel,
  onSubmit,
  onBack,
  submitting,
  below,
}: {
  title: string;
  initial?: VenueOffer;
  submitLabel: string;
  onSubmit: (draft: VenueOfferDraft) => void;
  onBack: () => void;
  submitting?: boolean;
  below?: ReactNode;
}) {
  const [audience, setAudience] = useState<ApiOfferAudience>(initial?.audience ?? 'ALL');

  const form = useYupForm<typeof offerSchema>({
    schema: offerSchema,
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      trigger: initial?.trigger ?? 'EVERY_NTH',
      discountType: initial?.discountType ?? 'FREE_GAME',
      discountValue: initial?.discountValue,
      maxDiscount: initial?.maxDiscount,
      code: initial?.code,
      everyGames: initial?.everyGames,
      minSubtotal: initial?.minSubtotal ?? 0,
      usageLimit: initial?.usageLimit,
    },
  });

  const trigger = form.watch('trigger');
  const discountType = form.watch('discountType');

  const setTrigger = (t: ApiOfferTrigger) => {
    form.setValue('trigger', t, { shouldValidate: true });
    // A promo code can't be a free game — fall back to a percentage discount.
    if (t === 'PROMO_CODE' && form.getValues('discountType') === 'FREE_GAME') {
      form.setValue('discountType', 'PERCENT', { shouldValidate: true });
    }
  };

  const submit = form.handleSubmit((v: OfferFormValues) => {
    onSubmit({
      title: v.title,
      description: v.description || undefined,
      trigger: v.trigger,
      discountType: v.discountType,
      // FREE_GAME ignores discountValue server-side; send 0 to satisfy the required column.
      discountValue: v.discountType === 'FREE_GAME' ? 0 : Number(v.discountValue),
      maxDiscount: v.discountType === 'PERCENT' && v.maxDiscount ? Number(v.maxDiscount) : undefined,
      minSubtotal: v.trigger === 'PROMO_CODE' ? Number(v.minSubtotal ?? 0) : 0,
      code: v.trigger === 'PROMO_CODE' ? v.code : undefined,
      everyGames: v.trigger === 'EVERY_NTH' ? Number(v.everyGames) : undefined,
      audience,
      usageLimit: v.trigger === 'PROMO_CODE' && v.usageLimit ? Number(v.usageLimit) : undefined,
      validFrom: initial?.validFrom ?? new Date().toISOString(),
      validUntil: initial?.validUntil ?? defaultValidUntil(),
      isActive: initial?.isActive ?? true,
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

      {/* Trigger */}
      <Field label="Type">
        <Segmented options={TRIGGERS} value={trigger} onChange={(v) => setTrigger(v as ApiOfferTrigger)} />
        {trigger === 'EVERY_NTH' ? (
          <FormInput
            control={form.control}
            name="everyGames"
            label="Reward every N games"
            placeholder="e.g. 10"
            leftIcon="repeat"
            keyboardType="number-pad"
          />
        ) : (
          <FormInput
            control={form.control}
            name="code"
            label="Promo code"
            placeholder="e.g. WELCOME20"
            leftIcon="award"
            autoCapitalize="characters"
          />
        )}
      </Field>

      {/* Reward */}
      <Field label="Reward">
        <Segmented
          options={trigger === 'EVERY_NTH' ? LOYALTY_REWARDS : PROMO_REWARDS}
          value={discountType}
          onChange={(v) => form.setValue('discountType', v as ApiOfferDiscountType, { shouldValidate: true })}
        />
        {discountType !== 'FREE_GAME' ? (
          <FormInput
            control={form.control}
            name="discountValue"
            label={discountType === 'PERCENT' ? 'Percent off' : 'Amount off (NPR)'}
            placeholder={discountType === 'PERCENT' ? 'e.g. 20' : 'e.g. 200'}
            leftIcon={discountType === 'PERCENT' ? 'percent' : 'dollarSign'}
            keyboardType="number-pad"
          />
        ) : null}
        {discountType === 'PERCENT' ? (
          <FormInput
            control={form.control}
            name="maxDiscount"
            label="Max discount (NPR, optional)"
            placeholder="e.g. 500"
            leftIcon="dollarSign"
            keyboardType="number-pad"
          />
        ) : null}
      </Field>

      {/* Promo-only constraints */}
      {trigger === 'PROMO_CODE' ? (
        <Field label="Conditions">
          <FormInput
            control={form.control}
            name="minSubtotal"
            label="Minimum booking subtotal (NPR)"
            placeholder="0"
            leftIcon="dollarSign"
            keyboardType="number-pad"
          />
          <FormInput
            control={form.control}
            name="usageLimit"
            label="Total redemptions (optional)"
            placeholder="Unlimited"
            leftIcon="repeat"
            keyboardType="number-pad"
          />
        </Field>
      ) : null}

      {/* Audience */}
      <Field label="Who can use it">
        <Segmented options={AUDIENCES} value={audience} onChange={(v) => setAudience(v as ApiOfferAudience)} />
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
