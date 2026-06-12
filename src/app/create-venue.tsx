import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormScreen, ScreenHeader, StepProgress, Typography } from '@/components/common';
import {
  STEP_FIELDS,
  toVenueDraft,
  VENUE_FORM_DEFAULTS,
  type VenueFormValues,
  venueSchema,
} from '@/components/venue/onboarding/form';
import { StepHours } from '@/components/venue/onboarding/StepHours';
import { StepLocation } from '@/components/venue/onboarding/StepLocation';
import { StepPhotosBasics } from '@/components/venue/onboarding/StepPhotosBasics';
import { StepServicesPricing } from '@/components/venue/onboarding/StepServicesPricing';
import { StepVerification } from '@/components/venue/onboarding/StepVerification';
import { useTheme } from '@/hooks/use-theme';
import { useYupForm } from '@/lib/forms';
import { submitVenueDraft } from '@/lib/venues';
import { useActiveVenueStore, useAuthStore } from '@/stores';

const STEPS = [
  { title: 'Venue basics', subtitle: 'Cover photo, name and contact details.', scroll: true },
  { title: 'Where is your venue?', subtitle: 'Search or drop a pin so players find you.', scroll: false },
  { title: 'Sports & pricing', subtitle: 'Pick a sport and add at least one court.', scroll: true },
  { title: 'Operating hours', subtitle: 'When players can book.', scroll: true },
  { title: 'Verification', subtitle: 'Optional — documents for the Verified badge.', scroll: true },
] as const;

const LAST = STEPS.length - 1;

/**
 * Add a venue from the dashboard. Walks the multi-step form (basics → location →
 * sports & courts → hours → optional docs), then submits. The venue is created
 * PENDING (a super admin approves it before it's listed); on success we re-fetch
 * identity, make the new venue active, and return to the dashboard.
 */
export default function CreateVenue() {
  const theme = useTheme();
  const router = useRouter();
  const reloadIdentity = useAuthStore((s) => s.reloadIdentity);
  const setActiveVenueId = useActiveVenueStore((s) => s.setActiveVenueId);

  const form = useYupForm<typeof venueSchema>({
    schema: venueSchema,
    defaultValues: VENUE_FORM_DEFAULTS as Partial<VenueFormValues>,
  });

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // `skipVerification` drops any uploaded docs so the venue is created without them.
  const finalize = async ({ skipVerification = false } = {}) => {
    if (busy) return;
    setError(undefined);
    if (skipVerification) form.setValue('verification', undefined, { shouldValidate: false });
    if (!(await form.trigger())) return;
    setBusy(true);
    try {
      const venueId = await submitVenueDraft(toVenueDraft(form.getValues()));
      await reloadIdentity();
      setActiveVenueId(venueId);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your venue. Try again.');
      setBusy(false);
    }
  };

  const onPrimary = async () => {
    if (busy) return;
    setError(undefined);
    if (step < LAST) {
      if (await form.trigger(STEP_FIELDS[step])) setStep((s) => s + 1);
      return;
    }
    await finalize();
  };

  const onBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else router.back();
  };

  const meta = STEPS[step];

  return (
    <FormScreen
      scroll={meta.scroll}
      header={
        <View className="gap-lg">
          <ScreenHeader
            onBack={onBack}
            right={
              step === LAST ? (
                <Typography
                  variant="label-md"
                  color={theme.primary}
                  onPress={() => finalize({ skipVerification: true })}>
                  Skip
                </Typography>
              ) : undefined
            }
          />
          <StepProgress current={step + 1} total={STEPS.length} />
          <View className="gap-sm">
            <Typography variant="headline-lg">{meta.title}</Typography>
            <Typography variant="body-md" color={theme.inkMuted}>
              {meta.subtitle}
            </Typography>
          </View>
        </View>
      }
      footer={
        <>
          {error && (
            <Typography variant="label-md" color={theme.danger} style={{ textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          <Button
            size="lg"
            fullWidth
            className="rounded-full"
            rightIcon={step === LAST ? 'check' : 'moveRight'}
            loading={busy}
            onPress={onPrimary}>
            {step === LAST ? 'Create venue' : 'Continue'}
          </Button>
        </>
      }>
      {step === 0 && <StepPhotosBasics form={form} />}
      {step === 1 && <StepLocation form={form} />}
      {step === 2 && <StepServicesPricing form={form} />}
      {step === 3 && <StepHours form={form} />}
      {step === 4 && <StepVerification form={form} />}
    </FormScreen>
  );
}
