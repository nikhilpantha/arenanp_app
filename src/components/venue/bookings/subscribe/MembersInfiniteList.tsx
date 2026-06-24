import { FlatList, View } from 'react-native';

import { AppRefreshControl, Card, Icon, InlineLoader, Typography } from '@/components/common';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Subscription } from '@/lib/api/subscriptions';

import { MemberRow } from './MembersList';

/**
 * The full members history as an infinitely-scrolling list: a single FlatList that
 * loads the next page as the user nears the end. Used by the Members screen; the
 * plans-overview preview keeps the simpler {@link MembersList}.
 */
export function MembersInfiniteList({
  members,
  query,
  loading,
  loadingMore,
  onEndReached,
  onOpen,
  refreshing,
  onRefresh,
}: {
  members: Subscription[];
  query: string;
  /** Initial page is loading (no rows yet). */
  loading?: boolean;
  /** A further page is being fetched. */
  loadingMore?: boolean;
  onEndReached: () => void;
  onOpen: (s: Subscription) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const theme = useTheme();

  if (members.length === 0) {
    return (
      <Card elevation="sm">
        <View className="items-center gap-sm py-xl">
          <Icon name="users" size={26} color={theme.inkMuted} />
          <Typography variant="body-md" color={theme.inkMuted}>
            {loading ? 'Loading members…' : query ? `No members match “${query}”.` : 'No members here yet.'}
          </Typography>
        </View>
      </Card>
    );
  }

  // Card's non-pressable wrapper is content-sized, so we replicate its surface here
  // on a flex:1 View to let the FlatList fill the remaining screen height.
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.card,
          borderRadius: Radius['3xl'],
          paddingHorizontal: Spacing.md,
        },
        Shadow.sm,
      ]}>
      <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MemberRow member={item} divider={false} onPress={() => onOpen(item)} />
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.border }} />
        )}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          onRefresh ? (
            <AppRefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        ListFooterComponent={loadingMore ? <InlineLoader paddingVertical={16} /> : null}
      />
    </View>
  );
}
