import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Screen, Typography } from '@/components/common';
import { ProfileSection } from '@/components/venue/profile/ProfileSection';
import { VenueIdentityCard } from '@/components/venue/profile/VenueIdentityCard';
import { VenueHeader } from '@/components/venue/VenueHeader';
import { ACCOUNT_ROWS, MANAGE_ROWS, type ProfileRowItem } from '@/data/venue-profile';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores';

export default function VenueProfile() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  const onManagePress = (row: ProfileRowItem) => {
    if (row.href) router.push(row.href);
    else if (row.section) router.push({ pathname: '/venue-edit/[section]', params: { section: row.section } });
  };

  const onAccountPress = (row: ProfileRowItem) => {
    if (row.key === 'notifications') router.push('/notifications');
    else Alert.alert(row.title, 'This setting lands with the accounts API.');
  };

  return (
    <Screen scroll tabBarSafe>
      <VenueHeader title="Profile" />

      <VenueIdentityCard />

      <ProfileSection title="Manage venue" rows={MANAGE_ROWS} onRowPress={onManagePress} />
      <ProfileSection title="Account & settings" rows={ACCOUNT_ROWS} onRowPress={onAccountPress} />

      {profile?.phone ? (
        <Typography variant="label-sm" color={theme.inkMuted} style={{ textAlign: 'center', paddingTop: 16 }}>
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
        onPress={signOut}>
        Sign out
      </Button>
    </Screen>
  );
}
