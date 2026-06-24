import { View } from 'react-native';

import { Screen, SearchBar } from '@/components/common';
import { PlayerHeader } from '@/components/player/PlayerHeader';
import { useVenueBrowse } from '@/components/player/venues/use-venue-browse';
import { VenueList } from '@/components/player/venues/VenueList';
import { SportScope } from '@/components/venue/bookings/SportScope';
import { useRefresh } from '@/hooks/use-refresh';

export default function VenuesScreen() {
  const b = useVenueBrowse();
  const { refreshing, onRefresh } = useRefresh(b);

  return (
    <Screen tabBarSafe>
      <View className="pt-sm">
        <PlayerHeader title="Venues" />
      </View>

      <View className="gap-sm pb-md">
        <SearchBar
          value={b.query}
          onChangeText={b.setQuery}
          onClear={() => b.setQuery('')}
          placeholder="Search venues…"
        />
        <SportScope sports={b.sports} value={b.scope} onChange={b.setScope} />
      </View>

      <VenueList
        venues={b.venues}
        query={b.debouncedQuery}
        loading={b.loading}
        loadingMore={b.loadingMore}
        onEndReached={b.onEndReached}
        onOpen={b.open}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </Screen>
  );
}
