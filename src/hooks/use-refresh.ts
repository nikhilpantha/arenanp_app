import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/** Anything with a React Query `refetch` — a `useQuery`/`useInfiniteQuery` result. */
type Refetchable = { refetch: () => Promise<unknown> };

/**
 * Drives pull-to-refresh from React Query. Returns the `refreshing` flag +
 * `onRefresh` handler to feed into a `RefreshControl` (via the `refreshing` /
 * `onRefresh` props on `Screen`, `FormScreen`, or a list component).
 *
 * Pass the query objects a screen owns to refetch exactly those in parallel:
 *   const { refreshing, onRefresh } = useRefresh(bookingsQ, summaryQ);
 * Call with no args to refetch every query currently mounted on the screen —
 * handy when the queries live in child components:
 *   const { refreshing, onRefresh } = useRefresh();
 *
 * `refreshing` stays true until all refetches settle.
 */
export function useRefresh(...queries: Refetchable[]) {
  const queryClient = useQueryClient();
  // Hold the latest query list in a ref so `onRefresh` stays referentially
  // stable while always refetching the current queries.
  const queriesRef = useRef(queries);
  queriesRef.current = queries;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (queriesRef.current.length > 0) {
        await Promise.all(queriesRef.current.map((q) => q.refetch()));
      } else {
        // No explicit queries: refresh whatever is mounted on this screen.
        await queryClient.refetchQueries({ type: 'active' });
      }
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return { refreshing, onRefresh };
}
