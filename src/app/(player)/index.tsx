import { View } from 'react-native';

import { Screen, Typography } from '@/components/common';
import { PlayerHeader } from '@/components/player/PlayerHeader';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  return (
    <Screen scroll>
      <View className="pt-sm">
        <PlayerHeader />
      </View>
      <View className="gap-md pt-md">
        <Typography variant="headline-lg">Let&apos;s play</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          Nearby venues, live leagues and games to join — coming up here.
        </Typography>
      </View>
    </Screen>
  );
}
