import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Icon, SectionHeader, Typography } from '@/components/common';
import { Shadow } from '@/constants/theme';
import { QUICK_LINKS } from '@/data/dashboard';
import { useTheme } from '@/hooks/use-theme';

// Where each shortcut tile goes (support is a stub for now).
const ROUTES: Record<string, '/new-booking' | '/offers' | '/customers' | undefined> = {
  add: '/new-booking',
  offers: '/offers',
  customers: '/customers',
};

/** Row of shortcut tiles linking to the key venue actions. */
export function QuickActions() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="gap-md pt-xl">
      <SectionHeader title="Quick actions" />
      <View className="flex-row gap-sm">
        {QUICK_LINKS.map((q) => {
          const href = ROUTES[q.key];
          return (
          <Pressable
            key={q.key}
            accessibilityRole="button"
            accessibilityLabel={q.label}
            onPress={href ? () => router.push(href) : undefined}
            className="flex-1 items-center gap-xs">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl"
              style={[{ backgroundColor: theme.card }, Shadow.sm]}>
              <Icon name={q.icon} size={24} color={theme.primary} />
            </View>
            <Typography variant="label-sm" color={theme.ink} style={{ textAlign: 'center', textTransform: 'none' }}>
              {q.label}
            </Typography>
          </Pressable>
          );
        })}
      </View>
    </View>
  );
}
