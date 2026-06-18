import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen, ScreenHeader } from '@/components/common';
import { MembersFilters } from '@/components/venue/bookings/subscribe/MembersFilters';
import type { ChipOption } from '@/components/venue/bookings/subscribe/MembersFilterSheet';
import { MembersInfiniteList } from '@/components/venue/bookings/subscribe/MembersInfiniteList';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  type SubscriptionStatus,
  useInfiniteVenueSubscriptions,
  useMembershipPlans,
} from '@/lib/api/subscriptions';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'expiring', label: 'Expiring' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];

/** Map a filter chip to the status sent to the API ("expiring" is a derived subset of active). */
function queryStatus(filter: StatusFilter): SubscriptionStatus | undefined {
  if (filter === 'all') return undefined;
  if (filter === 'expiring') return 'active';
  if (filter === 'upcoming') return 'scheduled';
  return filter;
}

export default function MembersScreen() {
  const router = useRouter();
  // Deep-linked from a plan's detail screen → pre-select that plan's filter.
  const params = useLocalSearchParams<{ planId?: string }>();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [planId, setPlanId] = useState<string>(params.planId ?? 'all');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  const plansQ = useMembershipPlans();
  const planOptions = useMemo<ChipOption<string>[]>(
    () => [
      { value: 'all', label: 'All plans' },
      ...(plansQ.data ?? []).map((p) => ({ value: p.id, label: p.name })),
    ],
    [plansQ.data],
  );

  const membersQ = useInfiniteVenueSubscriptions({
    status: queryStatus(status),
    search: debouncedQuery,
    planId: planId === 'all' ? undefined : planId,
  });

  const all = useMemo(
    () => membersQ.data?.pages.flatMap((p) => p.items) ?? [],
    [membersQ.data],
  );
  // "Expiring" is a client-side subset of the active page set (no dedicated API filter).
  const members = status === 'expiring' ? all.filter((m) => m.expiringSoon) : all;

  return (
    <Screen>
      <View className="pt-sm">
        <ScreenHeader title="Members" onBack={() => router.back()} />
      </View>

      <View className="pb-md pt-md">
        <MembersFilters
          query={query}
          onQueryChange={setQuery}
          statusOptions={STATUS_FILTERS}
          status={status}
          onStatusChange={setStatus}
          planOptions={planOptions}
          planId={planId}
          onPlanChange={setPlanId}
        />
      </View>

      <MembersInfiniteList
        members={members}
        query={query}
        loading={membersQ.isLoading}
        loadingMore={membersQ.isFetchingNextPage}
        onEndReached={() => {
          if (membersQ.hasNextPage && !membersQ.isFetchingNextPage) membersQ.fetchNextPage();
        }}
        onOpen={(m) => router.push({ pathname: '/member/[id]', params: { id: m.id } })}
      />
    </Screen>
  );
}
