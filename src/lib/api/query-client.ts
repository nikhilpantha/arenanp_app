import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client. Wraps the app (see app/_layout.tsx) so data
 * screens can use `useQuery`/`useMutation` over the GraphQL client. Auth itself
 * uses {@link import('./client').gqlRequest} directly.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
