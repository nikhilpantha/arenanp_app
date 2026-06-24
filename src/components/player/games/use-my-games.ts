import { useMemo } from 'react';

import { type PlayerBooking, useMyBookings } from '@/lib/api/player-bookings';
import { useMySubscriptions } from '@/lib/api/player-subscriptions';

import { isUpcoming } from './booking-status';

/** Loads the player's bookings (Upcoming / Past tabs) + memberships (Memberships tab). */
export function useMyGames() {
  const q = useMyBookings();
  const subs = useMySubscriptions();
  const all = useMemo(() => q.data?.pages.flatMap((p) => p.items) ?? [], [q.data]);

  const upcoming = useMemo<PlayerBooking[]>(() => all.filter((b) => isUpcoming(b.status)), [all]);
  const past = useMemo<PlayerBooking[]>(() => all.filter((b) => !isUpcoming(b.status)), [all]);

  return {
    upcoming,
    past,
    memberships: subs.data ?? [],
    membershipsLoading: subs.isLoading,
    loading: q.isLoading,
    loadingMore: q.isFetchingNextPage,
    onEndReached: () => {
      if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
    },
    /** Refetch bookings + memberships — wire to pull-to-refresh via `useRefresh`. */
    refetch: () => Promise.all([q.refetch(), subs.refetch()]),
  };
}
