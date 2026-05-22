import { View } from 'react-native';
import { Link, Stack } from 'expo-router';

import { Screen, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

export default function NotFoundScreen() {
  const theme = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Screen>
        <View className="flex-1 items-center justify-center gap-md">
          <Typography variant="headline-md">This screen does not exist.</Typography>
          <Link href="/">
            <Typography color={theme.primaryDark}>Go back home</Typography>
          </Link>
        </View>
      </Screen>
    </>
  );
}
