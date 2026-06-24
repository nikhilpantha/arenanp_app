import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar, Button, Card, Icon, Screen, Typography } from '@/components/common';
import { BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDisplayUri } from '@/lib/api/uploads';
import { canAccessVenuePanel } from '@/lib/panels';
import { useAuthStore } from '@/stores';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const setInitialPanel = useAuthStore((s) => s.setInitialPanel);
  const avatarUri = useDisplayUri(profile?.avatarUrl);

  // Only an account that also holds a venue relationship sees the switch.
  const canSwitchToVenue = canAccessVenuePanel(profile);

  const switchToVenue = async () => {
    await setInitialPanel('venue');
    router.replace('/');
  };

  return (
    <Screen>
      <View className="flex-1 gap-lg pt-lg">
        <Typography variant="headline-lg">Profile</Typography>

        {/* Tappable identity card → the shared edit-profile screen. */}
        <Card elevation="md" className="flex-row items-center gap-md" onPress={() => router.push('/edit-profile')}>
          <Avatar src={avatarUri} fallback={profile?.fullName ?? 'You'} size={56} />
          <View className="flex-1 gap-[2px]">
            <Typography variant="headline-md" numberOfLines={1}>
              {profile?.fullName ?? 'Your profile'}
            </Typography>
            {profile?.phone ? (
              <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
                {profile.phone}
              </Typography>
            ) : null}
          </View>
          <Icon name="chevronRight" size={20} color={theme.inkMuted} />
        </Card>
      </View>

      {/* Lifted clear of the native tab bar so it stays tappable. */}
      <View className="gap-sm" style={{ marginBottom: BottomTabInset }}>
        {canSwitchToVenue ? (
          <Button
            size="lg"
            fullWidth
            leftIcon="building"
            className="rounded-full"
            onPress={switchToVenue}>
            Switch to Venue
          </Button>
        ) : null}
        <Button variant="tertiary" size="lg" fullWidth leftIcon="lock" className="rounded-full" onPress={signOut}>
          Sign out
        </Button>
      </View>
    </Screen>
  );
}
