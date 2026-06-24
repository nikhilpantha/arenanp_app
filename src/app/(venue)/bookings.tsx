import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button, Fab, Icon, Modal, Screen, Segmented, Typography } from '@/components/common';
import { BookingCard } from '@/components/venue/bookings/BookingCard';
import { BookingsEmptyState } from '@/components/venue/bookings/BookingsEmptyState';
import { MembershipRequestCard } from '@/components/venue/bookings/MembershipRequestCard';
import { RequestCard } from '@/components/venue/bookings/RequestCard';
import { type Scope, SportScope } from '@/components/venue/bookings/SportScope';
import { SubscriptionsTab } from '@/components/venue/bookings/SubscriptionsTab';
import { SummaryCards } from '@/components/venue/bookings/SummaryCards';
import { VenueHeader } from '@/components/venue/VenueHeader';
import { TAB, type Tab } from '@/constants/bookings';
import { TAB_BAR_HEIGHT } from '@/constants/theme';
import { BOOKING_SPORTS, bySport } from '@/data/venue-bookings';
import { useRefresh } from '@/hooks/use-refresh';
import { useTheme } from '@/hooks/use-theme';
import { useSetSubscriptionStatus, useVenueSubscriptions } from '@/lib/api/subscriptions';
import {
  useAcceptBookingRequest,
  useActiveVenueId,
  useBookingRequests,
  useBookingsApiEnabled,
  useDeclineBookingRequest,
  useVenueBookings,
  useVenueBookingSummary,
  useVenueCourts,
} from '@/lib/api/venue-bookings';
import { subscriptionOccursOn, subscriptionToSession } from '@/lib/subscription-format';
import { labelToMinutes } from '@/lib/time';
import type { SportType, VenueBooking } from '@/types';

const TABS: { value: Tab; label: string }[] = [
  { value: TAB.today, label: 'Today' },
  { value: TAB.upcoming, label: 'Tomorrow' },
  { value: TAB.requests, label: 'Requests' },
  { value: TAB.recurring, label: 'Memberships' },
];

/** Local-time "YYYY-MM-DD" for today + an offset in days (venue-local, not UTC). */
function isoDay(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Merge real bookings with virtual subscription sessions, sorted by start time. */
function byStart(a: VenueBooking, b: VenueBooking): number {
  return (labelToMinutes(a.startLabel) ?? 0) - (labelToMinutes(b.startLabel) ?? 0);
}

export default function VenueBookings() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom + TAB_BAR_HEIGHT + 88;

  const apiEnabled = useBookingsApiEnabled();
  const venueId = useActiveVenueId();
  const hasVenue = !!venueId;

  // Live data from the API. When there's no venue (or no bookings) the queries
  // resolve empty, so the empty state shows — no mock fallback.
  const todayQ = useVenueBookings('today');
  const upcomingQ = useVenueBookings('upcoming');
  const summaryQ = useVenueBookingSummary();
  const requestsQ = useBookingRequests();
  const acceptM = useAcceptBookingRequest();
  const declineM = useDeclineBookingRequest();

  const [tab, setTab] = useState<Tab>(TAB.today);
  const [scope, setScope] = useState<Scope>('all');
  const [noVenueModal, setNoVenueModal] = useState(false);

  const subsQ = useVenueSubscriptions();
  const pendingSubsQ = useVenueSubscriptions('pending');
  const setSubStatus = useSetSubscriptionStatus();
  const membershipRequests = pendingSubsQ.data ?? [];

  const todayIso = isoDay(0);
  const tomorrowIso = isoDay(1);
  const subs = subsQ.data ?? [];

  // Each day's list = real bookings on that day + virtual subscription sessions for it.
  const sessionsFor = (dateIso: string): VenueBooking[] =>
    subs.filter((s) => subscriptionOccursOn(s, dateIso)).map((s) => subscriptionToSession(s, dateIso));

  const today = [...(todayQ.data ?? []), ...sessionsFor(todayIso)].sort(byStart);
  // "Tomorrow" tab: backend's upcoming scope returns tomorrow-onward, so filter to tomorrow.
  const upcoming = [
    ...(upcomingQ.data ?? []).filter((b) => b.date === tomorrowIso),
    ...sessionsFor(tomorrowIso),
  ].sort(byStart);
  const requests = requestsQ.data ?? [];
  const loading = tab === TAB.today ? todayQ.isLoading : upcomingQ.isLoading;

  // Sport filter chips come from the sports the venue offers (its courts). Falls back
  // to the sports present in the current bookings, then the catalog.
  const courtsQ = useVenueCourts();

  const { refreshing, onRefresh } = useRefresh(
    todayQ,
    upcomingQ,
    summaryQ,
    requestsQ,
    pendingSubsQ,
    subsQ,
    courtsQ,
  );
  const venueSports = Array.from(new Set<SportType>((courtsQ.data ?? []).map((c) => c.sportSlug)));
  const presentSports = Array.from(new Set<SportType>([...today, ...upcoming].map((b) => b.sport)));
  const sportChips = venueSports.length
    ? venueSports
    : presentSports.length
      ? presentSports
      : BOOKING_SPORTS;

  // A single-sport venue has nothing to filter: hide the row and pin the scope to it.
  const onlySport = sportChips.length === 1 ? sportChips[0] : null;
  const effectiveScope: Scope = onlySport ?? scope;

  const openDetails = (b: VenueBooking) =>
    router.push({
      pathname: '/booking/[id]',
      params: {
        id: b.id,
        customer: b.customer,
        phone: b.phone ?? '',
        sport: b.sport,
        court: b.court,
        time: `${b.startLabel} – ${b.endLabel}`,
        date: b.date,
        price: String(b.amount),
        status: b.status,
        payment: b.payment,
        freeGame: b.freeGame ? '1' : '',
      },
    });

  // A membership session opens the member's program detail; a real booking opens its detail.
  const openCard = (b: VenueBooking) => {
    if (b.isSubscription && b.subscriptionId) {
      router.push({ pathname: '/member/[id]', params: { id: b.subscriptionId } });
    } else {
      openDetails(b);
    }
  };

  const list =
    tab === TAB.today ? bySport(today, effectiveScope) : bySport(upcoming, effectiveScope);

  // Surface the total pending count (court bookings + membership requests) on the tab.
  const requestCount = requests.length + membershipRequests.length;
  const tabOptions = TABS.map((t) =>
    t.value === TAB.requests && requestCount ? { ...t, badge: requestCount } : t,
  );

  return (
    <View style={{ flex: 1 }}>
      <Screen
        scroll
        contentContainerStyle={{ paddingBottom: bottomPad }}
        refreshing={refreshing}
        onRefresh={onRefresh}>
        <VenueHeader title="Bookings" />
        <View className="gap-md pb-md">
          <SummaryCards
            bookingsToday={summaryQ.data?.bookingsToday}
            revenueToday={summaryQ.data?.revenueToday}
            pendingPayments={summaryQ.data?.pendingPayments}
            freeGamesDue={apiEnabled ? 0 : undefined}
          />
          <Segmented options={tabOptions} value={tab} onChange={(v) => setTab(v as Tab)} />
        </View>

        <View className="gap-lg pb-xl">
          {(tab === TAB.today || tab === TAB.upcoming) && sportChips.length > 1 ? (
            <SportScope sports={sportChips} value={scope} onChange={setScope} />
          ) : null}

          {tab === TAB.requests ? (
            <View className="gap-lg">
              {apiEnabled && (requestsQ.isLoading || pendingSubsQ.isLoading) ? (
                <Typography
                  variant="body-md"
                  color={theme.inkMuted}
                  style={{ textAlign: 'center', paddingVertical: 24 }}>
                  Loading requests…
                </Typography>
              ) : requests.length === 0 && membershipRequests.length === 0 ? (
                <BookingsEmptyState
                  label="No pending requests"
                  hint="Online booking + membership requests show up here to accept or decline."
                />
              ) : (
                <>
                  {requests.length ? (
                    <View className="gap-md">
                      {membershipRequests.length ? (
                        <Typography variant="label-md" color={theme.inkMuted}>
                          Court bookings
                        </Typography>
                      ) : null}
                      {requests.map((req) => (
                        <RequestCard
                          key={req.id}
                          request={req}
                          onAccept={() => acceptM.mutate(req.id)}
                          onDecline={() => declineM.mutate({ bookingId: req.id })}
                        />
                      ))}
                    </View>
                  ) : null}

                  {membershipRequests.length ? (
                    <View className="gap-md">
                      {requests.length ? (
                        <Typography variant="label-md" color={theme.inkMuted}>
                          Memberships
                        </Typography>
                      ) : null}
                      {membershipRequests.map((sub) => (
                        <MembershipRequestCard
                          key={sub.id}
                          request={sub}
                          loading={setSubStatus.isPending}
                          onAccept={() =>
                            setSubStatus.mutate({
                              subscriptionId: sub.id,
                              status: new Date(sub.startedAt) > new Date() ? 'scheduled' : 'active',
                            })
                          }
                          onDecline={() =>
                            setSubStatus.mutate({ subscriptionId: sub.id, status: 'cancelled' })
                          }
                        />
                      ))}
                    </View>
                  ) : null}
                </>
              )}
            </View>
          ) : tab === TAB.recurring ? (
            <SubscriptionsTab scope={scope} onManagePlans={() => router.push('/memberships')} />
          ) : (
            <View className="gap-sm">
              {loading ? (
                <Typography
                  variant="body-md"
                  color={theme.inkMuted}
                  style={{ textAlign: 'center', paddingVertical: 24 }}>
                  Loading bookings…
                </Typography>
              ) : list.length === 0 ? (
                <BookingsEmptyState
                  label={tab === TAB.today ? 'No bookings today' : 'No bookings tomorrow'}
                  hint="Bookings and member sessions for the day show up here."
                />
              ) : (
                list.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onPress={() => openCard(b)}
                    onManage={() => openDetails(b)}
                  />
                ))
              )}
            </View>
          )}
        </View>
      </Screen>

      {/* The Memberships tab manages recurring slots, so its primary action creates one. */}
      <Fab
        label={tab === TAB.recurring ? 'New membership' : 'New booking'}
        onPress={() => {
          if (!hasVenue) return setNoVenueModal(true);
          router.push(tab === TAB.recurring ? '/membership/book' : '/new-booking');
        }}
        accessibilityLabel={tab === TAB.recurring ? 'New membership' : 'New booking'}
      />

      <Modal visible={noVenueModal} onClose={() => setNoVenueModal(false)}>
        <View className="items-center gap-md">
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: `${theme.primary}1A` }}>
            <Icon name="mapPin" size={26} color={theme.primary} />
          </View>
          <Typography variant="headline-md" style={{ textAlign: 'center' }}>
            Add a venue first
          </Typography>
          <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
            You need a venue before you can take bookings. Create your venue to start accepting
            bookings.
          </Typography>
          <View className="w-full gap-sm pt-sm">
            <Button
              size="lg"
              fullWidth
              leftIcon="plus"
              onPress={() => {
                setNoVenueModal(false);
                router.push('/create-venue');
              }}>
              Add venue
            </Button>
            <Button variant="ghost" size="md" fullWidth onPress={() => setNoVenueModal(false)}>
              Not now
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
