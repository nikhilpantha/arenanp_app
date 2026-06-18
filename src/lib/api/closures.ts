import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { gqlRequest, isApiConfigured } from './client';
import { type ApiClosure, CREATE_CLOSURE, DELETE_CLOSURE, VENUE_CLOSURES } from './operations';
import { useActiveVenueId } from './venue-bookings';

/** A venue closure as the management screens use it (a direct view of the backend row). */
export interface VenueClosure {
  id: string;
  /** Blocked court id, or null for a whole-venue closure. */
  courtId: string | null;
  startAt: string;
  endAt: string;
  reason?: string;
}

/** What the create form submits — instants are already absolute UTC ISO strings. */
export interface VenueClosureDraft {
  courtId?: string;
  startAt: string;
  endAt: string;
  reason?: string;
}

function mapApiClosure(c: ApiClosure): VenueClosure {
  return {
    id: c.id,
    courtId: c.courtId,
    startAt: c.startAt,
    endAt: c.endAt,
    reason: c.reason ?? undefined,
  };
}

export function useClosuresApiEnabled(): boolean {
  const venueId = useActiveVenueId();
  return isApiConfigured && !!venueId;
}

/** Upcoming (not-yet-ended) closures for the active venue, soonest first. */
export function useVenueClosures() {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['venueClosures', venueId],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<VenueClosure[]> => {
      const r = await gqlRequest<{ venueClosures: ApiClosure[] }>(VENUE_CLOSURES, {
        input: { venueId, upcomingOnly: true },
      });
      return r.venueClosures.map(mapApiClosure);
    },
  });
}

export function useCreateClosure() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draft: VenueClosureDraft) =>
      gqlRequest(CREATE_CLOSURE, {
        input: {
          venueId,
          courtId: draft.courtId,
          startAt: draft.startAt,
          endAt: draft.endAt,
          reason: draft.reason,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venueClosures', venueId] }),
  });
}

export function useDeleteClosure() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (closureId: string) => gqlRequest(DELETE_CLOSURE, { venueId, closureId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venueClosures', venueId] }),
  });
}
