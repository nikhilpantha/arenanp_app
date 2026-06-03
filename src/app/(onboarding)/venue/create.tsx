import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

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
import { clearVenueDraft, loadVenueDraft, saveVenueDraft } from '@/lib/onboarding-draft';
import { submitVenueDraft } from '@/lib/venues';
import { useAuthStore } from '@/stores';

const STEPS = [
  { title: 'Venue basics', subtitle: 'Photos, name and contact details.', scroll: true },
  { title: 'Where is your venue?', subtitle: 'Search or drop a pin so players find you.', scroll: false },
  { title: 'Sports & pricing', subtitle: 'What you offer, courts, slots and price.', scroll: true },
  { title: 'Operating hours', subtitle: 'When players can book.', scroll: true },
  { title: 'Verification', subtitle: 'Optional — earn a Verified badge.', scroll: true },
] as const;

const LAST = STEPS.length - 1;

export default function VenueCreate() {
  const theme = useTheme();
  const userId = useAuthStore((s) => s.session?.user.id);
  const completeVenueOnboarding = useAuthStore((s) => s.completeVenueOnboarding);
  const signOut = useAuthStore((s) => s.signOut);

  const form = useYupForm<typeof venueSchema>({
    schema: venueSchema,
    defaultValues: VENUE_FORM_DEFAULTS as Partial<VenueFormValues>,
  });

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const hydrated = useRef(false);

  // Resume a saved draft after an app restart.
  useEffect(() => {
    if (!userId || hydrated.current) return;
    hydrated.current = true;
    void loadVenueDraft(userId).then((draft) => {
      if (draft) form.reset({ ...VENUE_FORM_DEFAULTS, ...draft } as Partial<VenueFormValues>);
    });
  }, [userId, form]);

  const persist = () => {
    if (userId) void saveVenueDraft(userId, form.getValues());
  };

  // Submit the venue and finish onboarding. `skipVerification` drops any uploaded docs so
  // the venue is created unverified (the Skip action on the last step).
  const finalize = async ({ skipVerification = false } = {}) => {
    if (busy) return;
    setError(undefined);
    if (skipVerification) {
      form.setValue('verification', undefined, { shouldValidate: false });
    }
    if (!(await form.trigger())) return;
    setBusy(true);
    try {
      await submitVenueDraft(toVenueDraft(form.getValues()));
      if (userId) await clearVenueDraft(userId);
      await completeVenueOnboarding();
      // status → 'authed' (owner) → root guard swaps to the venue dashboard.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your venue. Try again.');
      setBusy(false);
    }
  };

  const onPrimary = async () => {
    if (busy) return;
    setError(undefined);

    if (step < LAST) {
      if (await form.trigger(STEP_FIELDS[step])) {
        persist();
        setStep((s) => s + 1);
      }
      return;
    }

    await finalize();
  };

  const onBack = () => {
    if (step > 0) {
      persist();
      setStep((s) => s - 1);
    } else {
      // First step has nothing behind it in onboarding — back is the sign-out escape.
      void signOut();
    }
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
