import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Screen, ScreenHeader, Typography } from '@/components/common';
import { ProfileSection } from '@/components/venue/profile/ProfileSection';
import { ACCOUNT_ROWS, type ProfileRowItem } from '@/data/venue-profile';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores';

/**
 * Venue-owner account page, opened from the profile icon in the dashboard header.
 * Holds account settings and sign-out — venue management
 * itself lives on the "Venues" tab.
 */
export default function VenueAccount() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  // This is a top-level (ungated) screen, so the auth-status guards don't redirect
  // it on sign-out — navigate to the root, which routes to /welcome when signed out.
  const onSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const onAccountPress = (row: ProfileRowItem) => {
    if (row.key === 'notifications') router.push('/notifications');
    else Alert.alert(row.title, 'This setting lands with the accounts API.');
  };

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Account" onBack={() => router.back()} />
      </View>

      <View className="gap-md pt-md">
        <ProfileSection title="Account & settings" rows={ACCOUNT_ROWS} onRowPress={onAccountPress} />

        {profile?.phone ? (
          <Typography
            variant="label-sm"
            color={theme.inkMuted}
            style={{ textAlign: 'center', paddingTop: 16 }}>
            {profile.fullName ? `${profile.fullName} · ` : ''}
            {profile.phone}
          </Typography>
        ) : null}

        <Button
          variant="tertiary"
          size="lg"
          fullWidth
          leftIcon="lock"
          className="mt-md rounded-full"
          onPress={onSignOut}>
          Sign out
        </Button>
      </View>
    </Screen>
  );
}
