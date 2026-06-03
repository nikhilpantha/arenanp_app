import { View } from 'react-native';

import { Button, Screen, Typography } from '@/components/common';
import { BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores';

export default function ProfileScreen() {
  const theme = useTheme();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <Screen>
      <View className="flex-1 gap-sm pt-lg">
        <Typography variant="headline-lg">Profile</Typography>
        {profile?.phone && (
          <Typography variant="body-md" color={theme.inkMuted}>
            {profile.fullName ? `${profile.fullName} · ` : ''}
            {profile.phone}
          </Typography>
        )}
      </View>

      {/* Lifted clear of the native tab bar so it stays tappable. */}
      <Button
        variant="tertiary"
        size="lg"
        fullWidth
        leftIcon="lock"
        className="rounded-full"
        style={{ marginBottom: BottomTabInset }}
        onPress={signOut}>
        Sign out
      </Button>
    </Screen>
  );
}
