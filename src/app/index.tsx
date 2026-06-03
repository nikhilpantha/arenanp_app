import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores';

export default function Index() {
  const theme = useTheme();
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.profile?.role);

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
    // No role yet → role picker; owner → venue setup; player → sport interests.
    if (!role) return <Redirect href="/role" />;
    return <Redirect href={role === 'owner' ? '/venue/create' : '/player/sports'} />;
  }

  return <Redirect href={role === 'owner' ? '/(venue)/dashboard' : '/(player)'} />;
}
