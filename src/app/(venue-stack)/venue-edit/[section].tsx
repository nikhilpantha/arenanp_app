import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, FormScreen, ScreenHeader, Typography } from '@/components/common';
import { STEP_FIELDS, type VenueFormValues, venueSchema } from '@/components/venue/onboarding/form';
import { StepHours } from '@/components/venue/onboarding/StepHours';
import { StepLocation } from '@/components/venue/onboarding/StepLocation';
import { StepPhotosBasics } from '@/components/venue/onboarding/StepPhotosBasics';
import { StepServicesPricing } from '@/components/venue/onboarding/StepServicesPricing';
import { StepVerification } from '@/components/venue/onboarding/StepVerification';
import { useTheme } from '@/hooks/use-theme';
import { useUpdateVenueProfile } from '@/lib/api/venue';
import { useBookingsApiEnabled } from '@/lib/api/venue-bookings';
import { useYupForm } from '@/lib/forms';
import { VENUE_EDIT_META,type VenueEditSection } from '@/lib/venue-edit';
import { useVenueStore } from '@/stores';

/** Renders the onboarding step UI that owns the given section. */
function SectionFields({ section, form }: { section: VenueEditSection; form: UseFormReturn<VenueFormValues> }) {
  switch (section) {
    case 'location':
      return <StepLocation form={form} />;
    case 'services':
      return <StepServicesPricing form={form} />;
    case 'hours':
      return <StepHours form={form} />;
    case 'verification':
      return <StepVerification form={form} />;
    default:
      return <StepPhotosBasics form={form} />;
  }
}

export default function VenueEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ section?: string }>();
  const section: VenueEditSection =
    params.section && params.section in VENUE_EDIT_META ? (params.section as VenueEditSection) : 'basics';
  const meta = VENUE_EDIT_META[section];

  const venue = useVenueStore((s) => s.venue);
  const updateVenue = useVenueStore((s) => s.updateVenue);
  const apiEnabled = useBookingsApiEnabled();
  const updateProfile = useUpdateVenueProfile();

  const form = useYupForm<typeof venueSchema>({
    schema: venueSchema,
    defaultValues: venue as Partial<VenueFormValues>,
  });

  const [busy, setBusy] = useState(false);

  const onSave = async () => {
    if (busy) return;
    // Validate only the fields this section owns, then merge them into the saved venue.
    if (!(await form.trigger(STEP_FIELDS[meta.stepIndex]))) return;
    setBusy(true);
    const values = form.getValues();
    try {
      // Live: persist profile fields (basics / location / hours / contact / extras).
      // Sports/courts + verification editing isn't wired to the backend yet.
      if (apiEnabled) await updateProfile.mutateAsync(values);
      updateVenue(values);
      router.back();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
      setBusy(false);
    }
  };

  return (
    <FormScreen
      scroll={meta.scroll}
      header={
        <View className="gap-lg">
          <ScreenHeader onBack={() => router.back()} />
          <View className="gap-sm">
            <Typography variant="headline-lg">{meta.title}</Typography>
            <Typography variant="body-md" color={theme.inkMuted}>
              {meta.subtitle}
            </Typography>
          </View>
        </View>
      }
      footer={
        <Button size="lg" fullWidth className="rounded-full" rightIcon="check" loading={busy} onPress={onSave}>
          Save changes
        </Button>
      }>
      <SectionFields section={section} form={form} />
    </FormScreen>
  );
}
