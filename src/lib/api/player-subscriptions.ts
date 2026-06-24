import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { gqlRequest, isApiConfigured } from './client';
import {
  type ApiSubscription,
  COURT_TAKEN_SLOTS,
  CREATE_MY_SUBSCRIPTION,
  MY_SUBSCRIPTIONS,
} from './operations';
import { mapSubscription, type Subscription } from './subscriptions';

export interface CreateMySubscriptionVars {
  venueId: string;
  planId: string;
  courtId: string;
  /** "HH:mm" daily start time (must fit one of the plan's bands). */
  slotStart: string;
  /** ISO start date; expiry = start + plan validity. */
  startDate: string;
}

/** Subscribe the signed-in player to a venue plan. Activates directly (pay at the venue). */
export function useCreateMySubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateMySubscriptionVars) =>
      gqlRequest<{ createMySubscription: ApiSubscription }>(CREATE_MY_SUBSCRIPTION, { input: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mySubscriptions'] }),
  });
}

/** Daily slot starts ("HH:mm") already taken on a court over a membership's date range. */
export function useCourtTakenSlots(courtId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['courtTakenSlots', courtId, startDate, endDate],
    enabled: isApiConfigured && !!courtId && !!startDate && !!endDate,
    queryFn: async (): Promise<string[]> => {
      const r = await gqlRequest<{ courtTakenSlots: string[] }>(COURT_TAKEN_SLOTS, {
        courtId,
        startDate,
        endDate,
      });
      return r.courtTakenSlots;
    },
  });
}

/** The signed-in player's memberships across venues. */
export function useMySubscriptions() {
  return useQuery({
    queryKey: ['mySubscriptions'],
    enabled: isApiConfigured,
    queryFn: async (): Promise<Subscription[]> => {
      const r = await gqlRequest<{ mySubscriptions: ApiSubscription[] }>(MY_SUBSCRIPTIONS);
      return r.mySubscriptions.map(mapSubscription);
    },
  });
}
