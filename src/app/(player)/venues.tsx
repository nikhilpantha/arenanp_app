import { View } from 'react-native';

import { Screen, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

export default function VenuesScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <View className="gap-md pt-lg">
        <Typography variant="display-lg">Venues</Typography>
      </View>
    </Screen>
  );
}
