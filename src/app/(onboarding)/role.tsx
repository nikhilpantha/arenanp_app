import { useState } from 'react';
import { View } from 'react-native';

import { Button, FormScreen, ScreenHeader, Typography } from '@/components/common';
import { RoleSelect } from '@/components/onboarding/RoleSelect';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores';
import type { Panel } from '@/types';

/**
 * Fallback panel picker for an authenticated account with no panel chosen yet
 * (e.g. a session restored with no local profile). The normal flow sets the panel
 * before sign-up, so this is rarely seen.
 */
export default function RoleScreen() {
  const theme = useTheme();
  const setInitialPanel = useAuthStore((s) => s.setInitialPanel);
  const signOut = useAuthStore((s) => s.signOut);

  const [role, setRole] = useState<Panel | null>(null);
  const [busy, setBusy] = useState(false);

  const onContinue = async () => {
    if (!role || busy) return;
    setBusy(true);
    // Setting the panel flips status to 'authed' → the root guard swaps to that
    // panel's dashboard (neither panel has an onboarding step).
    await setInitialPanel(role);
  };

  return (
    <FormScreen
      header={<ScreenHeader onBack={signOut} />}
      footer={
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          rightIcon="moveRight"
          disabled={!role}
          loading={busy}
          onPress={onContinue}>
          Continue
        </Button>
      }>
      <View className="gap-lg">
        <View className="gap-sm">
          <Typography variant="headline-lg">How would you like to use the app?</Typography>
          <Typography variant="body-md" color={theme.inkMuted}>
            Pick the experience that fits you. One role per account.
          </Typography>
        </View>

        <RoleSelect value={role} onChange={setRole} />
      </View>
    </FormScreen>
  );
}
