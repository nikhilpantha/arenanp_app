import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { InlineLoader, SectionHeader } from '@/components/common';
import { RECURRING_BOOKINGS } from '@/data/venue-bookings';
import { useSubscriptionsApiEnabled, useVenueSubscriptions } from '@/lib/api/subscriptions';
import { subscriptionToRecurring } from '@/lib/subscription-format';
import type { SportType } from '@/types';

import { BookingsEmptyState } from './BookingsEmptyState';
import { RecurringCard } from './RecurringCard';

function bySport<T extends { sport: SportType }>(items: T[], scope: SportType | 'all'): T[] {
  return scope === 'all' ? items : items.filter((i) => i.sport === scope);
}

export function SubscriptionsTab({
  scope,
  onManagePlans,
}: {
  scope: SportType | 'all';
  onManagePlans: () => void;
}) {
  const apiEnabled = useSubscriptionsApiEnabled();

  return (
    <View className="gap-md">
      <SectionHeader
        title="Memberships"
        subtitle="Currently-running memberships"
        actionLabel="Manage plans"
        onActionPress={onManagePlans}
      />
      {apiEnabled ? <LiveSubscriptions scope={scope} /> : <MockSubscriptions scope={scope} />}
    </View>
  );
}

function LiveSubscriptions({ scope }: { scope: SportType | 'all' }) {
  const router = useRouter();
  // Only currently-running memberships belong on this tab; paused/expired/upcoming live
  // on the Members screen. Tapping a card opens the member detail (manage it there).
  const subsQ = useVenueSubscriptions('active');

  if (subsQ.isLoading) return <InlineLoader />;
  if (subsQ.isError) {
    return (
      <BookingsEmptyState
        label="Couldn't load memberships"
        hint={subsQ.error instanceof Error ? subsQ.error.message : 'Pull to refresh and try again.'}
      />
    );
  }

  const subs = (subsQ.data ?? []).filter((s) => scope === 'all' || s.sports.includes(scope));
  if (subs.length === 0) {
    return (
      <BookingsEmptyState
        label="No running memberships"
        hint="Tap “New membership” to put a customer on a recurring plan."
      />
    );
  }

  return (
    <>
      {subs.map((s) => (
        <RecurringCard
          key={s.id}
          booking={subscriptionToRecurring(s)}
          onPress={() => router.push({ pathname: '/member/[id]', params: { id: s.id } })}
        />
      ))}
    </>
  );
}

function MockSubscriptions({ scope }: { scope: SportType | 'all' }) {
  const recurring = RECURRING_BOOKINGS;
  if (recurring.length === 0) {
    return (
      <BookingsEmptyState
        label="No running memberships"
        hint="Tap “New membership” to put a customer on a recurring plan."
      />
    );
  }
  return (
    <>
      {bySport(recurring, scope).map((r) => (
        <RecurringCard key={r.id} booking={r} />
      ))}
    </>
  );
}
