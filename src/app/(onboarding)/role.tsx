import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormScreen, ScreenHeader, Typography } from '@/components/common';
import { RoleSelect } from '@/components/onboarding/RoleSelect';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores';
import type { UserRole } from '@/types';

/**
 * Fallback role picker for an authenticated account with no role yet (e.g. a
 * sign-in that skipped sign-up). The normal flow sets the role before sign-up,
 * so this is rarely seen.
 */
export default function RoleScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profileRole = useAuthStore((s) => s.profile?.role);
  const setRoleStore = useAuthStore((s) => s.setRole);
  const signOut = useAuthStore((s) => s.signOut);

  const [role, setRole] = useState<UserRole | null>(null);
  const [busy, setBusy] = useState(false);

  // Role already chosen (the normal post-verify path): skip the picker and jump straight
  // to that role's onboarding step — owners to venue setup, players to sport interests.
  useEffect(() => {
    if (profileRole === 'owner') router.replace('/venue/create');
    else if (profileRole === 'player') router.replace('/player/sports');
  }, [profileRole, router]);

  const onContinue = async () => {
    if (!role || busy) return;
    setBusy(true);
    await setRoleStore(role);
    // Both roles still need onboarding: owners set up a venue, players pick sports.
    router.replace(role === 'owner' ? '/venue/create' : '/player/sports');
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
