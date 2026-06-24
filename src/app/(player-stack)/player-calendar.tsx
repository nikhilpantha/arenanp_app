import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Icon, Screen, ScreenHeader, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

/**
 * Player schedule — the player's own bookings + joined games in a date view. Opened
 * from the header calendar action. Placeholder for now (the live schedule lands later).
 */
export default function PlayerCalendarScreen() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="My schedule" onBack={() => router.back()} />
      </View>
      <View className="flex-1 items-center justify-center gap-sm pt-xl">
        <Icon name="calendarDays" size={28} color={theme.inkMuted} />
        <Typography variant="label-lg">Nothing scheduled</Typography>
        <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
          Your upcoming bookings and games will appear here.
        </Typography>
      </View>
    </Screen>
  );
}
