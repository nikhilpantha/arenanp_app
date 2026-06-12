import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Icon, Typography } from '@/components/common';
import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Empty-state shown on the dashboard when the owner has no venues yet. Routes to
 * the multi-step create-venue flow (which requires at least one court).
 */
export function AddVenueCard() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="gap-md rounded-3xl p-lg" style={[{ backgroundColor: theme.card }, Shadow.sm]}>
      <View className="flex-row items-center gap-sm">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${theme.primary}1A` }}>
          <Icon name="building" size={24} color={theme.primary} />
        </View>
        <View className="flex-1 gap-xs">
          <Typography variant="label-lg">Create your first venue</Typography>
          <Typography variant="body-md" color={theme.inkMuted} style={{ textTransform: 'none' }}>
            Add your venue, pick a sport and set up at least one court so players can book.
          </Typography>
        </View>
      </View>
      <Button
        size="md"
        fullWidth
        className="rounded-full"
        leftIcon="plus"
        onPress={() => router.push('/create-venue')}>
        Create venue
      </Button>
    </View>
  );
}
