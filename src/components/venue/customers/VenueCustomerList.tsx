import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { Avatar, Badge, Button, Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { VenueCustomer } from '@/lib/api/venue-customers';

/**
 * Infinite-loading list of the venue's customers with loyalty. Renders a
 * `FlatList` that calls `onEndReached` to fetch the next page, plus loading /
 * error / empty states.
 */
export function VenueCustomerList({
  customers,
  query,
  loading,
  error,
  loadingMore,
  onOpen,
  onEndReached,
  onRetry,
}: {
  customers: VenueCustomer[];
  query: string;
  loading?: boolean;
  error?: boolean;
  loadingMore?: boolean;
  onOpen: (customer: VenueCustomer) => void;
  onEndReached?: () => void;
  onRetry?: () => void;
}) {
  const theme = useTheme();

  // An error with no prior results: distinguish a load failure from a genuinely
  // empty venue, and offer a way out of the spinner.
  if (error && customers.length === 0) {
    return (
      <Card elevation="sm">
        <View className="items-center gap-sm py-xl">
          <Icon name="xCircle" size={26} color={theme.inkMuted} />
          <Typography variant="body-md" color={theme.inkMuted}>
            Couldn’t load customers.
          </Typography>
          {onRetry ? (
            <Button variant="tertiary" size="sm" leftIcon="repeat" onPress={onRetry}>
              Retry
            </Button>
          ) : null}
        </View>
      </Card>
    );
  }

  if (customers.length === 0) {
    return (
      <Card elevation="sm">
        <View className="items-center gap-sm py-xl">
          <Icon name="users" size={26} color={theme.inkMuted} />
          <Typography variant="body-md" color={theme.inkMuted}>
            {loading ? 'Loading customers…' : query ? `No customers match “${query}”.` : 'No customers yet.'}
          </Typography>
        </View>
      </Card>
    );
  }

  return (
    <Card elevation="sm" className="flex-1" style={{ padding: 0 }}>
      <FlatList
        data={customers}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => <Row customer={item} onPress={() => onOpen(item)} />}
        ItemSeparatorComponent={() => (
          <View style={{ borderBottomWidth: 1, borderColor: theme.border }} />
        )}
        className="px-md"
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-md">
              <ActivityIndicator color={theme.inkMuted} />
            </View>
          ) : null
        }
      />
    </Card>
  );
}

function Row({ customer, onPress }: { customer: VenueCustomer; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-md py-md"
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
      <Avatar fallback={customer.name} size={44} />
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-md" numberOfLines={1}>
          {customer.name}
        </Typography>
        <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
          {customer.phone ? `${customer.phone} · ` : ''}
          {customer.gamesPlayed} games
        </Typography>
      </View>
      {customer.freeGameReady ? (
        <Badge variant="success">🎉 Free game</Badge>
      ) : (
        <Badge variant="neutral">{`${customer.gamesPlayed} games`}</Badge>
      )}
    </Pressable>
  );
}
