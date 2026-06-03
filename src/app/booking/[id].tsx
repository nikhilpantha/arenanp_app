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
import { SPORTS_CATALOG } from '@/data/sports';
import type { SportType } from '@/types';

export default function BookingDetailScreen() {
  const router = useRouter();
  const p = useLocalSearchParams<{
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

  const sportEntry = SPORTS_CATALOG.find((e) => e.sport === (p.sport as SportType));
  const freeGame = p.freeGame === '1';
  const statusMeta = resolveStatusBadge(p.status);
  const payMeta = resolvePaymentBadge(p.payment, freeGame);

  // Customer insights — the phone number is the loyalty card; match it to a known customer.
  const customer = p.phone ? getCustomerByPhone(p.phone) : null;

  const confirm = (title: string) => Alert.alert(title, undefined, [{ text: 'OK', onPress: () => router.back() }]);

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
          emoji={sportEntry?.emoji ?? '🏟️'}
          title={`${sportEntry?.label ?? p.sport} · ${p.court}`}
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
        <Button size="lg" fullWidth className="rounded-full" rightIcon="check" onPress={() => confirm('Marked complete')}>
          Mark complete
        </Button>
        <Button variant="ghost" size="lg" fullWidth onPress={() => confirm('Booking cancelled')}>
          Cancel booking
        </Button>
      </View>
    </Screen>
  );
}
