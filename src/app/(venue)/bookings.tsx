import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Fab, Screen, SectionHeader, Segmented, Typography } from '@/components/common';
import { BookingCard } from '@/components/venue/bookings/BookingCard';
import { BookingsEmptyState } from '@/components/venue/bookings/BookingsEmptyState';
import { RecurringCard } from '@/components/venue/bookings/RecurringCard';
import { type Scope, SportScope } from '@/components/venue/bookings/SportScope';
import { SummaryCards } from '@/components/venue/bookings/SummaryCards';
import { VenueHeader } from '@/components/venue/VenueHeader';
import { TAB_BAR_HEIGHT } from '@/constants/theme';
import {
  BOOKING_SPORTS,
  bySport,
  RECURRING_BOOKINGS,
  TODAY_BOOKINGS,
  UPCOMING_BOOKINGS,
} from '@/data/venue-bookings';
import { useTheme } from '@/hooks/use-theme';
import {
  useBookingsApiEnabled,
  useSetBookingStatus,
  useVenueBookings,
  useVenueBookingSummary,
} from '@/lib/api/venue-bookings';
import type { BookingStatus, RecurringBooking, SportType, VenueBooking } from '@/types';

type Tab = 'today' | 'upcoming' | 'recurring';

const TABS: { value: Tab; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'recurring', label: 'Recurring' },
];

export default function VenueBookings() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom + TAB_BAR_HEIGHT + 88;

  const apiEnabled = useBookingsApiEnabled();

  // Live data (API). Disabled queries return undefined, so the mock fallback applies.
  const todayQ = useVenueBookings('today');
  const upcomingQ = useVenueBookings('upcoming');
  const summaryQ = useVenueBookingSummary();
  const setStatusM = useSetBookingStatus();

  const [tab, setTab] = useState<Tab>('today');
  const [scope, setScope] = useState<Scope>('all');
  // Mock fallback state (used only when the API isn't configured).
  const [localToday, setLocalToday] = useState<VenueBooking[]>(TODAY_BOOKINGS);
  const [localUpcoming, setLocalUpcoming] = useState<VenueBooking[]>(UPCOMING_BOOKINGS);
  const [recurring, setRecurring] = useState<RecurringBooking[]>(RECURRING_BOOKINGS);

  const today = apiEnabled ? (todayQ.data ?? []) : localToday;
  const upcoming = apiEnabled ? (upcomingQ.data ?? []) : localUpcoming;
  const loading = apiEnabled && (tab === 'today' ? todayQ.isLoading : upcomingQ.isLoading);

  // Sport filter chips: the union of sports actually present (falls back to the catalog).
  const presentSports = Array.from(
    new Set<SportType>([...today, ...upcoming].map((b) => b.sport)),
  );
  const sportChips = presentSports.length ? presentSports : BOOKING_SPORTS;

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

  // Status change: API mutation when live, else local state.
  const setStatus = (id: string, status: BookingStatus) => {
    if (apiEnabled) setStatusM.mutate({ bookingId: id, status });
    else setLocalToday((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const cancelUpcoming = (id: string) => {
    if (apiEnabled) setStatusM.mutate({ bookingId: id, status: 'cancelled' });
    else setLocalUpcoming((list) => list.filter((x) => x.id !== id));
  };

  const manageToday = (b: VenueBooking) =>
    Alert.alert(b.customer, `${b.startLabel} – ${b.endLabel} · ${b.court}`, [
      { text: 'Check in', onPress: () => setStatus(b.id, 'checked-in') },
      { text: 'Mark completed', onPress: () => setStatus(b.id, 'completed') },
      { text: 'Mark no-show', style: 'destructive', onPress: () => setStatus(b.id, 'no-show') },
      { text: 'Close', style: 'cancel' },
    ]);

  const manageUpcoming = (b: VenueBooking) =>
    Alert.alert(b.customer, `${b.date} · ${b.startLabel} – ${b.endLabel}`, [
      { text: 'Edit', onPress: () => openDetails(b) },
      { text: 'Contact customer', onPress: () => Alert.alert('Contact', b.phone ? `Calling ${b.phone}…` : 'No number on file.') },
      { text: 'Cancel booking', style: 'destructive', onPress: () => cancelUpcoming(b.id) },
      { text: 'Close', style: 'cancel' },
    ]);

  const togglePause = (id: string) =>
    setRecurring((list) =>
      list.map((r) => (r.id === id ? { ...r, status: r.status === 'paused' ? 'active' : 'paused' } : r)),
    );

  const cancelRecurring = (b: RecurringBooking) =>
    Alert.alert('Cancel subscription?', `${b.customer} · ${b.packageName}`, [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel', style: 'destructive', onPress: () => setRecurring((list) => list.filter((x) => x.id !== b.id)) },
    ]);

  const list = tab === 'today' ? bySport(today, scope) : bySport(upcoming, scope);

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentContainerStyle={{ paddingBottom: bottomPad }}>
        <VenueHeader title="Bookings" />
        <View className="gap-md pb-md">
          <SummaryCards
            bookingsToday={summaryQ.data?.bookingsToday}
            revenueToday={summaryQ.data?.revenueToday}
            pendingPayments={summaryQ.data?.pendingPayments}
            freeGamesDue={apiEnabled ? 0 : undefined}
          />
          <Segmented options={TABS} value={tab} onChange={(v) => setTab(v as Tab)} />
        </View>

        <View className="gap-lg pb-xl">
          {tab !== 'recurring' ? <SportScope sports={sportChips} value={scope} onChange={setScope} /> : null}

          {tab === 'recurring' ? (
            <View className="gap-md">
              <SectionHeader
                title="Subscriptions"
                subtitle="Recurring slots held by members"
                actionLabel="Manage plans"
                onActionPress={() => router.push('/memberships')}
              />
              {bySport(recurring, scope).map((r) => (
                <RecurringCard
                  key={r.id}
                  booking={r}
                  onPause={() => togglePause(r.id)}
                  onRenew={() => Alert.alert('Renewed', `${r.customer}'s ${r.packageName} renewed.`)}
                  onCancel={() => cancelRecurring(r)}
                />
              ))}
            </View>
          ) : (
            <View className="gap-sm">
              {loading ? (
                <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center', paddingVertical: 24 }}>
                  Loading bookings…
                </Typography>
              ) : list.length === 0 ? (
                <BookingsEmptyState
                  label={tab === 'today' ? 'No bookings today' : 'No upcoming bookings'}
                  hint="New bookings will show up here."
                />
              ) : (
                list.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onPress={() => openDetails(b)}
                    onManage={() => (tab === 'today' ? manageToday(b) : manageUpcoming(b))}
                  />
                ))
              )}
            </View>
          )}
        </View>
      </Screen>

      <Fab label="New booking" onPress={() => router.push('/new-booking')} accessibilityLabel="New booking" />
    </View>
  );
}
