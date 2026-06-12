import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Screen, ScreenHeader } from '@/components/common';
import { resolvePaymentBadge, resolveStatusBadge } from '@/components/venue/bookings/booking-meta';
import {
  BookingCustomerCard,
  BookingFacts,
  BookingHero,
} from '@/components/venue/bookings/BookingDetailCards';
import { CustomerInsights } from '@/components/venue/CustomerInsights';
import { getCustomerByPhone } from '@/data/customers';
import { useSportBySlug } from '@/lib/api/sports';
import { useBookingsApiEnabled, useSetBookingStatus } from '@/lib/api/venue-bookings';
import type { BookingStatus } from '@/types';

export default function BookingDetailScreen() {
  const router = useRouter();
  const p = useLocalSearchParams<{
    id?: string;
    sport?: string;
    court?: string;
    time?: string;
    date?: string;
    price?: string;
    customer?: string;
    phone?: string;
    status?: string;
    payment?: string;
    freeGame?: string;
  }>();

  const apiEnabled = useBookingsApiEnabled();
  const setStatusM = useSetBookingStatus();

  const sportName = useSportBySlug(p.sport)?.name ?? p.sport ?? 'Sport';
  const freeGame = p.freeGame === '1';
  const statusMeta = resolveStatusBadge(p.status);
  const payMeta = resolvePaymentBadge(p.payment, freeGame);

  // Customer insights — the phone number is the loyalty card; match it to a known customer.
  const customer = p.phone ? getCustomerByPhone(p.phone) : null;

  const confirm = (title: string) => Alert.alert(title, undefined, [{ text: 'OK', onPress: () => router.back() }]);

  // Status actions: live mutation when configured, else a confirmation toast (mock).
  const changeStatus = (status: BookingStatus, mockTitle: string) => {
    if (apiEnabled && p.id) {
      setStatusM.mutate(
        { bookingId: p.id, status },
        {
          onSuccess: () => router.back(),
          onError: (e) => Alert.alert('Action failed', e instanceof Error ? e.message : 'Please try again.'),
        },
      );
    } else {
      confirm(mockTitle);
    }
  };

  const facts = [
    { label: 'Date', value: p.date ?? '—' },
    { label: 'Time', value: p.time ?? '—' },
    { label: 'Court', value: p.court ?? '—' },
    { label: 'Amount', value: freeGame ? 'Free game' : p.price ? `Rs ${p.price}` : '—' },
  ];

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Booking" onBack={() => router.back()} />
      </View>

      <View className="mt-md gap-md">
        <BookingHero
          sportSlug={p.sport ?? ''}
          title={`${sportName} · ${p.court}`}
          time={p.time}
          status={statusMeta}
          payment={payMeta}
        />

        {p.customer ? (
          <BookingCustomerCard name={p.customer} phone={p.phone} onCall={() => confirm('Calling customer…')} />
        ) : null}

        {customer ? <CustomerInsights customer={customer} /> : null}

        <BookingFacts rows={facts} />
      </View>

      <View className="gap-sm pt-xl">
        <Button
          size="lg"
          fullWidth
          className="rounded-full"
          rightIcon="check"
          loading={setStatusM.isPending}
          onPress={() => changeStatus('completed', 'Marked complete')}>
          Mark complete
        </Button>
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onPress={() => changeStatus('cancelled', 'Booking cancelled')}>
          Cancel booking
        </Button>
      </View>
    </Screen>
  );
}
