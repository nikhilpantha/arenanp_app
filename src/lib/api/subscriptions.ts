import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { DayOfWeek, MembershipDuration, SportType } from '@/types';

import { gqlRequest, isApiConfigured } from './client';
import {
  type ApiMembershipDuration,
  type ApiMembershipPlan,
  type ApiMembershipStats,
  type ApiPageInfo,
  type ApiSubscription,
  type ApiSubscriptionPayment,
  type ApiSubscriptionStatus,
  CREATE_MEMBERSHIP_PLAN,
  CREATE_SUBSCRIPTION,
  DELETE_MEMBERSHIP_PLAN,
  RENEW_SUBSCRIPTION,
  SET_SUBSCRIPTION_STATUS,
  UPDATE_MEMBERSHIP_PLAN,
  VENUE_MEMBERSHIP_PLANS,
  VENUE_MEMBERSHIP_STATS,
  VENUE_PUBLIC_PLANS,
  VENUE_SUBSCRIPTION,
  VENUE_SUBSCRIPTIONS,
} from './operations';
import { useActiveVenueId } from './venue-bookings';

// ─── Enum mapping (app ⇄ API) ─────────────────────────────────────────────────

const DURATION_TO_API: Record<MembershipDuration, ApiMembershipDuration> = {
  weekly: 'WEEKLY',
  fortnightly: 'FORTNIGHTLY',
  monthly: 'MONTHLY',
  quarterly: 'QUARTERLY',
  'half-yearly': 'HALF_YEARLY',
  yearly: 'YEARLY',
};

const DURATION_FROM_API: Record<ApiMembershipDuration, MembershipDuration> = {
  WEEKLY: 'weekly',
  FORTNIGHTLY: 'fortnightly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  HALF_YEARLY: 'half-yearly',
  YEARLY: 'yearly',
};

export type SubscriptionStatus =
  | 'pending'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'expired';

const STATUS_FROM_API: Record<ApiSubscriptionStatus, SubscriptionStatus> = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

const STATUS_TO_API: Record<SubscriptionStatus, ApiSubscriptionStatus> = {
  pending: 'PENDING',
  scheduled: 'SCHEDULED',
  active: 'ACTIVE',
  paused: 'PAUSED',
  cancelled: 'CANCELLED',
  expired: 'EXPIRED',
};

// ─── App-facing shapes ─────────────────────────────────────────────────────────

/** A subscription time band, e.g. { start: "06:00", end: "08:00" }. */
export interface TimeWindow {
  start: string;
  end: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: MembershipDuration;
  validityDays: number;
  sessionMinutes: number;
  windows: TimeWindow[];
  daysOfWeek: DayOfWeek[];
  sports: SportType[];
  highlight?: string;
  isActive: boolean;
  activeSubscribers: number;
}

/** Parse a stored "HH:mm-HH:mm" band into a TimeWindow. */
function parseWindow(w: string): TimeWindow {
  const [start, end] = w.split('-');
  return { start: start ?? '', end: end ?? '' };
}

/** Serialise a TimeWindow back to "HH:mm-HH:mm" for the API. */
export function windowToString(w: TimeWindow): string {
  return `${w.start}-${w.end}`;
}

export interface SubscriptionPayment {
  id: string;
  amount: number;
  method?: string;
  status: 'paid' | 'pending' | 'partial';
  periodDays?: number;
  date: string;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  duration: MembershipDuration;
  price: number;
  sessionMinutes: number;
  slotStart: string;
  daysOfWeek: DayOfWeek[];
  sports: SportType[];
  courtId: string;
  courtName: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  status: SubscriptionStatus;
  expiringSoon: boolean;
  startedAt: string;
  expiresAt: string;
  payments: SubscriptionPayment[];
}

export interface MembershipStats {
  activeMembers: number;
  expiringSoon: number;
  monthlyRevenue: number;
  renewalRatePct: number;
}

const PAYMENT_STATUS_FROM_API: Record<ApiSubscriptionPayment['status'], SubscriptionPayment['status']> = {
  PAID: 'paid',
  PENDING: 'pending',
  PARTIAL: 'partial',
};

function mapPlan(p: ApiMembershipPlan): MembershipPlan {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    price: p.price,
    duration: DURATION_FROM_API[p.duration],
    validityDays: p.validityDays,
    sessionMinutes: p.sessionMinutes,
    windows: p.windows.map(parseWindow),
    daysOfWeek: p.daysOfWeek as DayOfWeek[],
    sports: p.sports as SportType[],
    highlight: p.highlight ?? undefined,
    isActive: p.isActive,
    activeSubscribers: p.activeSubscribers,
  };
}

function mapPayment(p: ApiSubscriptionPayment): SubscriptionPayment {
  return {
    id: p.id,
    amount: p.amount,
    method: p.method ?? undefined,
    status: PAYMENT_STATUS_FROM_API[p.status],
    periodDays: p.periodDays ?? undefined,
    date: p.createdAt,
  };
}

export function mapSubscription(s: ApiSubscription): Subscription {
  return {
    id: s.id,
    planId: s.planId,
    planName: s.planName,
    duration: DURATION_FROM_API[s.duration],
    price: s.price,
    sessionMinutes: s.sessionMinutes,
    slotStart: s.slotStart,
    daysOfWeek: s.daysOfWeek as DayOfWeek[],
    sports: s.sports as SportType[],
    courtId: s.courtId,
    courtName: s.courtName,
    customerId: s.customerId,
    customerName: s.customerName,
    customerPhone: s.customerPhone ?? undefined,
    status: STATUS_FROM_API[s.status],
    expiringSoon: s.expiringSoon,
    startedAt: s.startedAt,
    expiresAt: s.expiresAt,
    payments: s.payments.map(mapPayment),
  };
}

function mapStats(s: ApiMembershipStats): MembershipStats {
  return {
    activeMembers: s.activeMembers,
    expiringSoon: s.expiringSoon,
    monthlyRevenue: s.monthlyRevenue,
    renewalRatePct: s.renewalRatePct,
  };
}

/** True when the API is configured and a venue is resolved (gates live queries). */
export function useSubscriptionsApiEnabled(): boolean {
  const venueId = useActiveVenueId();
  return isApiConfigured && !!venueId;
}

// ─── Plans ──────────────────────────────────────────────────────────────────

export function useMembershipPlans(activeOnly?: boolean) {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['venueMembershipPlans', venueId, activeOnly ?? false],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<MembershipPlan[]> => {
      const r = await gqlRequest<{ venueMembershipPlans: ApiMembershipPlan[] }>(
        VENUE_MEMBERSHIP_PLANS,
        { input: { venueId, activeOnly } },
      );
      return r.venueMembershipPlans.map(mapPlan);
    },
  });
}

/**
 * Public: the active membership plans for a given venue, for the player venue-detail
 * screen. Unlike `useMembershipPlans` (which reads the owner's active venue), this takes
 * an explicit venueId and only ever returns active plans.
 */
export function useVenueMembershipPlans(venueId: string | undefined) {
  return useQuery({
    queryKey: ['publicVenueMembershipPlans', venueId],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<MembershipPlan[]> => {
      const r = await gqlRequest<{ venuePublicPlans: ApiMembershipPlan[] }>(VENUE_PUBLIC_PLANS, {
        venueId,
      });
      return r.venuePublicPlans.map(mapPlan);
    },
  });
}

export interface CreatePlanVars {
  name: string;
  description?: string;
  price: number;
  duration: MembershipDuration;
  sessionMinutes: number;
  windows: TimeWindow[];
  daysOfWeek: DayOfWeek[];
  sports: SportType[];
  highlight?: string;
}

export function useCreateMembershipPlan() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: CreatePlanVars): Promise<MembershipPlan> => {
      const r = await gqlRequest<{ createMembershipPlan: ApiMembershipPlan }>(
        CREATE_MEMBERSHIP_PLAN,
        {
          input: {
            venueId,
            name: vars.name,
            description: vars.description || undefined,
            price: vars.price,
            duration: DURATION_TO_API[vars.duration],
            sessionMinutes: vars.sessionMinutes,
            windows: vars.windows.map(windowToString),
            daysOfWeek: vars.daysOfWeek,
            sports: vars.sports,
            highlight: vars.highlight || undefined,
          },
        },
      );
      return mapPlan(r.createMembershipPlan);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venueMembershipPlans', venueId] }),
  });
}

export function useUpdateMembershipPlan() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: CreatePlanVars & { planId: string }): Promise<MembershipPlan> => {
      const r = await gqlRequest<{ updateMembershipPlan: ApiMembershipPlan }>(
        UPDATE_MEMBERSHIP_PLAN,
        {
          input: {
            venueId,
            planId: vars.planId,
            name: vars.name,
            description: vars.description || undefined,
            price: vars.price,
            duration: DURATION_TO_API[vars.duration],
            sessionMinutes: vars.sessionMinutes,
            windows: vars.windows.map(windowToString),
            daysOfWeek: vars.daysOfWeek,
            sports: vars.sports,
            highlight: vars.highlight || undefined,
          },
        },
      );
      return mapPlan(r.updateMembershipPlan);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venueMembershipPlans', venueId] }),
  });
}

/** Toggle a plan's availability (deactivated plans can't be subscribed to). */
export function useSetPlanActive() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { planId: string; isActive: boolean }): Promise<MembershipPlan> => {
      const r = await gqlRequest<{ updateMembershipPlan: ApiMembershipPlan }>(
        UPDATE_MEMBERSHIP_PLAN,
        { input: { venueId, planId: vars.planId, isActive: vars.isActive } },
      );
      return mapPlan(r.updateMembershipPlan);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venueMembershipPlans', venueId] }),
  });
}

export function useDeleteMembershipPlan() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string): Promise<void> => {
      await gqlRequest(DELETE_MEMBERSHIP_PLAN, { venueId, planId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venueMembershipPlans', venueId] }),
  });
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

interface ApiSubscriptionsPage {
  venueSubscriptions: { items: ApiSubscription[]; pageInfo: ApiPageInfo };
}

/** Variables shared by the paged + infinite subscription queries. */
export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  search?: string;
  planId?: string;
}

function listSubscriptionsInput(
  venueId: string | undefined,
  f: SubscriptionFilters,
  page: number,
  pageSize: number,
) {
  return {
    venueId,
    status: f.status ? STATUS_TO_API[f.status] : undefined,
    planId: f.planId || undefined,
    search: f.search?.trim() || undefined,
    pagination: { page, pageSize },
  };
}

/**
 * A single page of subscriptions (used for inline previews like the plans overview).
 * Returns just the items; for the full scrollable history use {@link useInfiniteVenueSubscriptions}.
 */
export function useVenueSubscriptions(status?: SubscriptionStatus, search?: string, pageSize = 20) {
  const venueId = useActiveVenueId();
  const term = search?.trim() || undefined;
  return useQuery({
    queryKey: ['venueSubscriptions', venueId, status ?? 'all', term ?? '', pageSize],
    enabled: isApiConfigured && !!venueId,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<Subscription[]> => {
      const r = await gqlRequest<ApiSubscriptionsPage>(VENUE_SUBSCRIPTIONS, {
        input: listSubscriptionsInput(venueId, { status, search }, 1, pageSize),
      });
      return r.venueSubscriptions.items.map(mapSubscription);
    },
  });
}

/** Active members on a single plan (one small page) — for the plan detail preview. */
export function usePlanActiveMembers(planId: string | undefined, pageSize = 5) {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['venueSubscriptions', 'planActive', venueId, planId, pageSize],
    enabled: isApiConfigured && !!venueId && !!planId,
    queryFn: async (): Promise<Subscription[]> => {
      const r = await gqlRequest<ApiSubscriptionsPage>(VENUE_SUBSCRIPTIONS, {
        input: listSubscriptionsInput(venueId, { status: 'active', planId }, 1, pageSize),
      });
      return r.venueSubscriptions.items.map(mapSubscription);
    },
  });
}

const SUBSCRIPTIONS_PAGE_SIZE = 20;

/** The full members history, paged for infinite scroll. Filter by status, plan and/or search term. */
export function useInfiniteVenueSubscriptions(filters: SubscriptionFilters) {
  const venueId = useActiveVenueId();
  const term = filters.search?.trim() || undefined;
  return useInfiniteQuery({
    queryKey: [
      'venueSubscriptions',
      'infinite',
      venueId,
      filters.status ?? 'all',
      filters.planId ?? 'all',
      term ?? '',
    ],
    enabled: isApiConfigured && !!venueId,
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const r = await gqlRequest<ApiSubscriptionsPage>(VENUE_SUBSCRIPTIONS, {
        input: listSubscriptionsInput(venueId, filters, pageParam, SUBSCRIPTIONS_PAGE_SIZE),
      });
      return {
        items: r.venueSubscriptions.items.map(mapSubscription),
        pageInfo: r.venueSubscriptions.pageInfo,
      };
    },
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? last.pageInfo.page + 1 : undefined),
  });
}

export function useVenueSubscription(subscriptionId: string | undefined) {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['venueSubscription', venueId, subscriptionId],
    enabled: isApiConfigured && !!venueId && !!subscriptionId,
    queryFn: async (): Promise<Subscription> => {
      const r = await gqlRequest<{ venueSubscription: ApiSubscription }>(VENUE_SUBSCRIPTION, {
        venueId,
        subscriptionId,
      });
      return mapSubscription(r.venueSubscription);
    },
  });
}

/** Invalidate every subscription-derived query after a write. */
function useInvalidateSubscriptions() {
  const venueId = useActiveVenueId();
  const qc = useQueryClient();
  return () => {
    // Matches both the paged (['venueSubscriptions', venueId, …]) and infinite
    // (['venueSubscriptions', 'infinite', venueId, …]) query keys.
    qc.invalidateQueries({ queryKey: ['venueSubscriptions'] });
    qc.invalidateQueries({ queryKey: ['venueSubscription', venueId] });
    qc.invalidateQueries({ queryKey: ['venueMembershipStats', venueId] });
    qc.invalidateQueries({ queryKey: ['venueMembershipPlans', venueId] });
  };
}

export function useCreateSubscription() {
  const venueId = useActiveVenueId();
  const invalidate = useInvalidateSubscriptions();
  return useMutation({
    mutationFn: async (vars: {
      customerId: string;
      planId: string;
      courtId: string;
      slotStart: string;
      startDate: string;
      amountPaid?: number;
      paymentMethod?: string;
    }): Promise<Subscription> => {
      const r = await gqlRequest<{ createSubscription: ApiSubscription }>(CREATE_SUBSCRIPTION, {
        input: {
          venueId,
          customerId: vars.customerId,
          planId: vars.planId,
          courtId: vars.courtId,
          slotStart: vars.slotStart,
          startDate: vars.startDate,
          amountPaid: vars.amountPaid,
          paymentMethod: vars.paymentMethod,
        },
      });
      return mapSubscription(r.createSubscription);
    },
    onSuccess: invalidate,
  });
}

export function useRenewSubscription() {
  const venueId = useActiveVenueId();
  const invalidate = useInvalidateSubscriptions();
  return useMutation({
    mutationFn: async (vars: {
      subscriptionId: string;
      amountPaid?: number;
      paymentMethod?: string;
    }): Promise<Subscription> => {
      const r = await gqlRequest<{ renewSubscription: ApiSubscription }>(RENEW_SUBSCRIPTION, {
        input: {
          venueId,
          subscriptionId: vars.subscriptionId,
          amountPaid: vars.amountPaid,
          paymentMethod: vars.paymentMethod,
        },
      });
      return mapSubscription(r.renewSubscription);
    },
    onSuccess: invalidate,
  });
}

export function useSetSubscriptionStatus() {
  const venueId = useActiveVenueId();
  const invalidate = useInvalidateSubscriptions();
  return useMutation({
    mutationFn: async (vars: {
      subscriptionId: string;
      status: SubscriptionStatus;
    }): Promise<Subscription> => {
      const r = await gqlRequest<{ setSubscriptionStatus: ApiSubscription }>(
        SET_SUBSCRIPTION_STATUS,
        { input: { venueId, subscriptionId: vars.subscriptionId, status: STATUS_TO_API[vars.status] } },
      );
      return mapSubscription(r.setSubscriptionStatus);
    },
    onSuccess: invalidate,
  });
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export function useMembershipStats() {
  const venueId = useActiveVenueId();
  return useQuery({
    queryKey: ['venueMembershipStats', venueId],
    enabled: isApiConfigured && !!venueId,
    queryFn: async (): Promise<MembershipStats> => {
      const r = await gqlRequest<{ venueMembershipStats: ApiMembershipStats }>(
        VENUE_MEMBERSHIP_STATS,
        { venueId },
      );
      return mapStats(r.venueMembershipStats);
    },
  });
}
