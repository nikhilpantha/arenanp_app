import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Button, Icon, Screen, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

export default function NotFoundScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Screen>
        <View className="flex-1 items-center justify-center px-page">
          <View className="items-center gap-lg">
            <View
              className="items-center justify-center rounded-full border"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
                height: 88,
                width: 88,
              }}>
              <Icon name="helpCircle" size={40} color={theme.primary} />
            </View>

            <View className="items-center gap-xs">
              <Typography variant="headline-md">This screen does not exist.</Typography>
              <Typography color={theme.inkMuted} style={{ textAlign: 'center' }}>
                The page you are looking for could not be found.
              </Typography>
            </View>

            <Button variant="primary" leftIcon="home" onPress={() => router.replace('/')}>
              Go back home
            </Button>
          </View>
        </View>
      </Screen>
    </>
  );
}
