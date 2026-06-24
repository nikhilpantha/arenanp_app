import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppRefreshControl,
  Button,
  Card,
  Icon,
  InlineLoader,
  Screen,
  Segmented,
  Typography,
} from '@/components/common';
import { MembershipCard } from '@/components/player/games/MembershipCard';
import { PlayerBookingCard } from '@/components/player/games/PlayerBookingCard';
import { useMyGames } from '@/components/player/games/use-my-games';
import { PlayerHeader } from '@/components/player/PlayerHeader';
import { useRefresh } from '@/hooks/use-refresh';
import { useTheme } from '@/hooks/use-theme';

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'memberships', label: 'Memberships' },
];

const EMPTY: Record<string, { title: string; hint: string }> = {
  upcoming: { title: 'Nothing booked yet', hint: 'Book a court and it will show up here.' },
  past: { title: 'No past games', hint: 'Your completed and cancelled bookings will appear here.' },
  memberships: { title: 'No memberships', hint: 'Subscribe to a venue plan and it will show up here.' },
};

export default function MyGamesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const games = useMyGames();
  const { refreshing, onRefresh } = useRefresh(games);
  const [tab, setTab] = useState('upcoming');

  const isMemberships = tab === 'memberships';
  const bookings = tab === 'upcoming' ? games.upcoming : games.past;
  const loading = isMemberships ? games.membershipsLoading : games.loading;
  const count = isMemberships ? games.memberships.length : bookings.length;

  return (
    <Screen tabBarSafe>
      <View className="pt-sm">
        <PlayerHeader title="My Games" />
      </View>

      <View className="pb-md">
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </View>

      {loading && count === 0 ? (
        <InlineLoader paddingVertical={48} />
      ) : count === 0 ? (
        <Card elevation="md" className="items-center gap-sm py-xl">
          <Icon name={isMemberships ? 'repeat' : 'calendarDays'} size={28} color={theme.primary} />
          <Typography variant="label-lg">{EMPTY[tab].title}</Typography>
          <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
            {EMPTY[tab].hint}
          </Typography>
          <Button size="md" leftIcon="search" className="mt-sm rounded-full" onPress={() => router.push('/venues')}>
            Browse venues
          </Button>
        </Card>
      ) : isMemberships ? (
        <FlatList
          data={games.memberships}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => <MembershipCard sub={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <PlayerBookingCard
              booking={item}
              onPress={() => router.push({ pathname: '/my-booking/[id]', params: { id: item.id } })}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={games.onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={games.loadingMore ? <InlineLoader paddingVertical={16} /> : null}
        />
      )}
    </Screen>
  );
}
