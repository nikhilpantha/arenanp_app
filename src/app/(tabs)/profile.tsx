import { View } from 'react-native';

import { Avatar, Button, Screen, Typography } from '@/components/common';
import { type MenuItem, MenuList } from '@/components/profile/MenuList';
import { useTheme } from '@/hooks/use-theme';

const PROFILE_MENU: readonly MenuItem[] = [
  { id: 'bookings', label: 'My Bookings', icon: 'calendar-outline' },
  { id: 'teams', label: 'My Teams', icon: 'people-outline' },
  { id: 'payments', label: 'Payment Methods', icon: 'card-outline' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline' },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' },
] as const;

export default function ProfileScreen() {
  const theme = useTheme();
  return (
    <Screen scroll>
      <View className="gap-lg pb-xl pt-lg">
        <View className="flex-row items-center gap-md">
          <Avatar fallback="NP" size={64} />
          <View className="flex-1 gap-xs">
            <Typography variant="headline-md">Nikhil Pantha</Typography>
            <Typography variant="label-md" color={theme.inkMuted}>
              nikitapanth207@gmail.com
            </Typography>
          </View>
        </View>
        <MenuList items={PROFILE_MENU} />
        <Button variant="danger" fullWidth onPress={() => console.log('[profile] logout')}>
          Log out
        </Button>
      </View>
    </Screen>
  );
}
