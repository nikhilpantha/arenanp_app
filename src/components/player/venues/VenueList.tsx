import { FlatList, View } from 'react-native';

import { AppRefreshControl, Card, Icon, InlineLoader, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { VenueCardData } from '@/lib/api/discovery';

import { VenueCard } from './VenueCard';

/** The marketplace venue list — infinitely scrolling cards with empty + paging states. */
export function VenueList({
  venues,
  query,
  loading,
  loadingMore,
  onEndReached,
  onOpen,
  refreshing,
  onRefresh,
}: {
  venues: VenueCardData[];
  query: string;
  /** Initial page is loading (no rows yet). */
  loading?: boolean;
  /** A further page is being fetched. */
  loadingMore?: boolean;
  onEndReached: () => void;
  onOpen: (venue: VenueCardData) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const theme = useTheme();

  if (loading && venues.length === 0) return <InlineLoader paddingVertical={48} />;

  if (venues.length === 0) {
    return (
      <Card elevation="sm" className="items-center gap-sm py-xl">
        <Icon name="building" size={28} color={theme.inkMuted} />
        <Typography variant="label-lg">No venues found</Typography>
        <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
          {query ? `Nothing matches “${query}”. Try another search or sport.` : 'No venues here yet.'}
        </Typography>
      </Card>
    );
  }

  return (
    <FlatList
      data={venues}
      keyExtractor={(v) => v.id}
      renderItem={({ item }) => <VenueCard venue={item} onPress={() => onOpen(item)} />}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <AppRefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListFooterComponent={loadingMore ? <InlineLoader paddingVertical={16} /> : null}
    />
  );
}
