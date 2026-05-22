import { View } from 'react-native';

import { Button, Screen, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

export default function VenuesScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <View className="gap-md pt-lg">
        <Typography variant="display-lg">Venues</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          Browse bookable venues across Nepal.
        </Typography>
        <Button variant="secondary" onPress={() => console.log('[venues] filter pressed')}>
          Filter
        </Button>
      </View>
    </Screen>
  );
}
