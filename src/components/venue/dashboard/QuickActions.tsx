import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Icon, SectionHeader, Typography } from '@/components/common';
import { Shadow } from '@/constants/theme';
import { QUICK_LINKS } from '@/data/dashboard';
import { useTheme } from '@/hooks/use-theme';

/** Row of shortcut tiles. Only "Add booking" is wired for now (TODO: the rest). */
export function QuickActions() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="gap-md pt-xl">
      <SectionHeader title="Quick actions" />
      <View className="flex-row gap-sm">
        {QUICK_LINKS.map((q) => (
          <Pressable
            key={q.key}
            accessibilityRole="button"
            accessibilityLabel={q.label}
            onPress={q.key === 'add' ? () => router.push('/new-booking') : undefined}
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
        ))}
      </View>
    </View>
  );
}
