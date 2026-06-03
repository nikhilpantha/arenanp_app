import { useState } from 'react';
import { View } from 'react-native';

import { Button, FormScreen, ScreenHeader, Typography } from '@/components/common';
import { FormSportChips } from '@/components/form';
import { useTheme } from '@/hooks/use-theme';
import { useYupForm } from '@/lib/forms';
import { type PlayerSportsFormValues, playerSportsSchema } from '@/lib/onboarding-schemas';
import { useAuthStore } from '@/stores';

export default function PlayerSportsScreen() {
  const theme = useTheme();
  const completePlayerOnboarding = useAuthStore((s) => s.completePlayerOnboarding);
  const signOut = useAuthStore((s) => s.signOut);

  const form = useYupForm<typeof playerSportsSchema>({
    schema: playerSportsSchema,
    defaultValues: { sports: [] },
  });

  const [busy, setBusy] = useState(false);
  const sports = form.watch('sports');

  const onSubmit = form.handleSubmit(async (values: PlayerSportsFormValues) => {
    setBusy(true);
    try {
      await completePlayerOnboarding(values.sports);
      // status → 'authed' → root guard swaps to the player tabs (home).
    } catch {
      setBusy(false);
    }
  });

  return (
    <FormScreen
      scroll
      header={<ScreenHeader onBack={signOut} />}
      footer={
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          rightIcon="moveRight"
          disabled={!sports?.length}
          loading={busy}
          onPress={onSubmit}>
          Continue
        </Button>
      }>
      <View className="gap-sm pb-xl">
        <Typography variant="headline-lg">What do you play?</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          Stadium Pulse focuses on these games near you. Pick the ones you&apos;re into — you can
          change this anytime in your profile.
        </Typography>
      </View>

      <FormSportChips control={form.control} name="sports" />
    </FormScreen>
  );
}
