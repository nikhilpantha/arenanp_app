import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';

import { type Scope } from '@/components/venue/bookings/SportScope';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useBrowseVenues,type VenueCardData } from '@/lib/api/discovery';
import { useSports } from '@/lib/api/sports';
import type { SportType } from '@/types';

/** State + data for the player Venues browse screen: search, sport filter, infinite list. */
export function useVenueBrowse() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data: catalog } = useSports();
  const sports = useMemo(() => (catalog ?? []).map((s) => s.slug as SportType), [catalog]);

  const browse = useBrowseVenues({ search: debouncedQuery, sportSlug: scope });
  const venues = useMemo(() => browse.data?.pages.flatMap((p) => p.items) ?? [], [browse.data]);

  const open = (v: VenueCardData) =>
    router.push({ pathname: '/venue/[id]', params: { id: v.id, name: v.name } });

  return {
    query,
    setQuery,
    debouncedQuery,
    scope,
    setScope,
    sports,
    venues,
    loading: browse.isLoading,
    loadingMore: browse.isFetchingNextPage,
    onEndReached: () => {
      if (browse.hasNextPage && !browse.isFetchingNextPage) browse.fetchNextPage();
    },
    /** Refetch the venue list — wire to pull-to-refresh via `useRefresh`. */
    refetch: () => browse.refetch(),
    open,
  };
}
