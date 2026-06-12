import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores';

export default function Index() {
  const theme = useTheme();
  const status = useAuthStore((s) => s.status);
  const activePanel = useAuthStore((s) => s.activePanel);

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  if (status === 'signedOut') {
    return <Redirect href="/welcome" />;
  }

  if (status === 'onboarding') {
    // The only onboarding case is an account with no panel chosen → the picker.
    // Both panels resolve straight to 'authed' otherwise.
    return <Redirect href="/role" />;
  }

  return <Redirect href={activePanel === 'venue' ? '/(venue)/dashboard' : '/(player)'} />;
}
