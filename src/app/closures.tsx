import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Screen, ScreenHeader, Typography, useToast } from '@/components/common';
import { ClosureList } from '@/components/venue/closures/ClosureList';
import { useTheme } from '@/hooks/use-theme';
import { useDeleteClosure, useVenueClosures } from '@/lib/api/closures';
import { useVenueCourts } from '@/lib/api/venue-bookings';

/**
 * "Closures" — venue-owner blocks on bookings. Block a single court for a few hours
 * or close the whole venue for several days; blocked times stop accepting bookings
 * (walk-in + online) and disappear from players' slot lists.
 */
export default function ClosuresScreen() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const closuresQ = useVenueClosures();
  const courtsQ = useVenueCourts();
  const deleteClosure = useDeleteClosure();

  const onDelete = async (id: string) => {
    try {
      await deleteClosure.mutateAsync(id);
      toast.success('Bookings are open again for this time', 'Block removed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Please try again.', "Couldn't remove block");
    }
  };

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Closures" onBack={() => router.back()} />
      </View>

      <View className="pt-sm">
        <Typography variant="body-md" color={theme.inkMuted}>
          Block a court or close the venue. No one can book during a block.
        </Typography>
      </View>

      <View className="pt-md">
        <Button
          size="lg"
          fullWidth
          leftIcon="plus"
          className="rounded-full"
          onPress={() => router.push('/closure/new')}>
          Block time
        </Button>
      </View>

      <View className="pt-xl">
        <ClosureList
          closures={closuresQ.data ?? []}
          courts={courtsQ.data ?? []}
          loading={closuresQ.isLoading}
          onDelete={onDelete}
        />
      </View>
    </Screen>
  );
}
