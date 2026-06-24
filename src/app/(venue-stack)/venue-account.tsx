import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, ScreenHeader, Typography } from '@/components/common';
import { ProfileSection } from '@/components/venue/profile/ProfileSection';
import { ACCOUNT_ROWS, type ProfileRowItem } from '@/data/venue-profile';
import { useTheme } from '@/hooks/use-theme';
import { canAccessPlayerPanel } from '@/lib/panels';
import { useAuthStore } from '@/stores';

/**
 * Venue-owner account page, opened from the profile icon in the dashboard header.
 * Holds account settings, panel switching and sign-out — venue management itself lives
 * on the "Venues" tab.
 */
export default function VenueAccount() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const setInitialPanel = useAuthStore((s) => s.setInitialPanel);

  // This is a top-level (ungated) screen, so the auth-status guards don't redirect
  // it on sign-out / switch — navigate to the root, which re-routes by panel/status.
  const onSignOut = async () => {
    await signOut();
    router.replace('/');
  };
  const switchToPlayer = async () => {
    await setInitialPanel('player');
    router.replace('/');
  };

  const onAccountPress = (row: ProfileRowItem) => {
    if (row.key === 'account') router.push('/edit-profile');
    else if (row.key === 'notifications') router.push('/notifications');
    else Alert.alert(row.title, 'This setting lands with the accounts API.');
  };

  // Session rows reuse the same list style as "Account & settings" (no loud button).
  const sessionRows: ProfileRowItem[] = [
    ...(canAccessPlayerPanel(profile)
      ? [
          {
            key: 'switch',
            title: 'Switch to Player',
            subtitle: 'Use the app as a player',
            icon: 'user' as const,
          },
        ]
      : []),
    { key: 'signout', title: 'Sign out', subtitle: 'Log out of your account', icon: 'lock' as const },
  ];

  const onSessionPress = (row: ProfileRowItem) => {
    if (row.key === 'switch') switchToPlayer();
    else if (row.key === 'signout') onSignOut();
  };

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Account" onBack={() => router.back()} />
      </View>

      <View className="pt-md">
        <ProfileSection title="Account & settings" rows={ACCOUNT_ROWS} onRowPress={onAccountPress} />

        <ProfileSection title="Session" rows={sessionRows} onRowPress={onSessionPress} />

        {profile?.phone ? (
          <Typography
            variant="label-sm"
            color={theme.inkMuted}
            style={{ textAlign: 'center', paddingTop: 24 }}>
            {profile.fullName ? `${profile.fullName} · ` : ''}
            {profile.phone}
          </Typography>
        ) : null}
      </View>
    </Screen>
  );
}
