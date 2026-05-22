import { FlatList, View } from 'react-native';

import { Typography } from '@/components/common';
import { VenueCard } from '@/components/venue/VenueCard';
import { useTheme } from '@/hooks/use-theme';
import type { Venue } from '@/types';

const MOCK_VENUES: Venue[] = [
  {
    id: 'v1',
    name: 'Kathmandu Arena',
    location: 'Lalitpur',
    sport: 'Futsal',
    pricePerHour: 1200,
  },
  {
    id: 'v2',
    name: 'Pulchowk Turf',
    location: 'Pulchowk',
    sport: 'Cricket',
    pricePerHour: 1500,
  },
  {
    id: 'v3',
    name: 'Patan Sports Hub',
    location: 'Patan',
    sport: 'Basketball',
    pricePerHour: 900,
  },
];

export function FeaturedVenues() {
  const theme = useTheme();
  return (
    <View className="mt-xl gap-md">
      <View className="flex-row items-center justify-between">
        <Typography variant="headline-md">Featured venues</Typography>
        <Typography
          variant="label-md"
          color={theme.primaryDark}
          onPress={() => console.log('[home] see all venues')}>
          See all
        </Typography>
      </View>
      <FlatList
        horizontal
        data={MOCK_VENUES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        ItemSeparatorComponent={() => <View className="w-md" />}
        renderItem={({ item }) => <VenueCard venue={item} />}
      />
    </View>
  );
}
