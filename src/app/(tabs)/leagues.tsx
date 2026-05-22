import { View } from 'react-native';

import { Button, Screen, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

export default function LeaguesScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <View className="gap-md pt-lg">
        <Typography variant="display-lg">Leagues</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          Standings, fixtures, and live matches.
        </Typography>
        <Button variant="ghost" onPress={() => console.log('[leagues] view all')}>
          View all
        </Button>
      </View>
    </Screen>
  );
}
