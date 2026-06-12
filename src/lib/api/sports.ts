import { useQuery } from '@tanstack/react-query';

import { gqlRequest, isApiConfigured } from './client';
import { type ApiSport, SPORTS } from './operations';

/**
 * The platform sports catalogue (active sports, admin-managed). Cached for a
 * while — it changes rarely — and shared across every consumer via the query key.
 */
export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    enabled: isApiConfigured,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ApiSport[]> => {
      const r = await gqlRequest<{ sports: ApiSport[] }>(SPORTS);
      return r.sports;
    },
  });
}

/** Look up a single sport by slug from the cached catalogue (undefined while loading / unknown). */
export function useSportBySlug(slug: string | null | undefined): ApiSport | undefined {
  const { data } = useSports();
  if (!slug) return undefined;
  return data?.find((s) => s.slug === slug);
}
