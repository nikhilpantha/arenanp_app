import { ActivityIndicator, Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Avatar, Button, Card, Screen, ScreenHeader, Typography } from '@/components/common';
import { CustomerInsights } from '@/components/venue/CustomerInsights';
import { CustomerBookingHistory } from '@/components/venue/customers/CustomerBookingHistory';
import { CustomerHeaderCard } from '@/components/venue/customers/CustomerHeaderCard';
import { CustomerLoyaltyCard } from '@/components/venue/customers/CustomerLoyaltyCard';
import { CustomerStatsCard } from '@/components/venue/customers/CustomerStatsCard';
import { LoyaltyProgress } from '@/components/venue/LoyaltyProgress';
import { SubjectOffers } from '@/components/venue/offers/SubjectOffers';
import { CUSTOMERS } from '@/data/customers';
import { useTheme } from '@/hooks/use-theme';
import {
  useCustomersApiEnabled,
  useSubjectLoyalty,
  useVenueCustomer,
  useVenueCustomerBookings,
} from '@/lib/api/venue-customers';
import type { LoyaltyState } from '@/lib/loyalty';

type Theme = ReturnType<typeof useTheme>;

export default function CustomerDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const apiEnabled = useCustomersApiEnabled();

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Customer" onBack={() => router.back()} />
      </View>
      {apiEnabled ? (
        <LiveCustomer id={id ?? ''} theme={theme} />
      ) : (
        <MockCustomer id={id ?? ''} theme={theme} onBook={() => router.push('/new-booking')} />
      )}
    </Screen>
  );
}

function LiveCustomer({ id, theme }: { id: string; theme: Theme }) {
  const router = useRouter();
  const customerQ = useVenueCustomer(id);
  const customer = customerQ.data;
  const loyaltyQ = useSubjectLoyalty({ customerId: id });
  const bookingsQ = useVenueCustomerBookings(id);
  const bookings = bookingsQ.data ?? [];

  if (customerQ.isLoading) {
    return (
      <View className="items-center justify-center pt-xl">
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }
  if (!customer) return <NotFound theme={theme} />;

  const l = loyaltyQ.data;
  const loyalty: LoyaltyState | null = l?.configured
    ? { gamesPlayed: l.gamesPlayed, freeAfter: l.every ?? 10, toNextFree: l.toNext, isFreeNext: l.ready }
    : null;

  // Performance the venue cares about, derived from this customer's bookings.
  const completed = bookings.filter((b) => b.status === 'completed');
  const spent = completed.reduce((sum, b) => sum + b.amount, 0);
  const lastVisit = bookings[0]?.date ?? '—';

  const goNewBooking = () =>
    router.push({
      pathname: '/new-booking',
      params: { customerId: customer.id, customerName: customer.name, customerPhone: customer.phone ?? '' },
    });

  return (
    <>
      <View className="mt-md gap-md">
        <Card elevation="md" className="flex-row items-center gap-md">
          <Avatar fallback={customer.name} size={52} />
          <View className="flex-1">
            <Typography variant="headline-md" numberOfLines={1}>
              {customer.name}
            </Typography>
            {customer.phone ? (
              <Typography variant="body-md" color={theme.inkMuted}>
                {customer.phone}
              </Typography>
            ) : null}
          </View>
          {customer.phone ? (
            <Button
              variant="tertiary"
              size="sm"
              className="rounded-full"
              leftIcon="bell"
              onPress={() => Alert.alert('Calling…', customer.phone)}>
              Call
            </Button>
          ) : null}
        </Card>

        <CustomerStatsCard games={customer.gamesPlayed} spent={spent} lastVisit={lastVisit} />

        {loyalty ? <CustomerLoyaltyCard loyalty={loyalty} /> : null}

        <CustomerBookingHistory bookings={bookings} loading={bookingsQ.isLoading} />
      </View>

      <View className="pt-xl">
        <Button size="lg" fullWidth className="rounded-full" rightIcon="arrowRight" onPress={goNewBooking}>
          New booking
        </Button>
      </View>
    </>
  );
}

function MockCustomer({ id, theme, onBook }: { id: string; theme: Theme; onBook: () => void }) {
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) return <NotFound theme={theme} />;

  return (
    <>
      <View className="mt-md gap-md">
        <CustomerHeaderCard customer={customer} onCall={() => Alert.alert('Calling…', customer.phone)} />
        <CustomerInsights customer={customer} />
        <LoyaltyProgress gamesPlayed={customer.gamesPlayed} />
        <SubjectOffers subjectType="customer" subjectId={customer.id} games={customer.gamesPlayed} />
      </View>

      <View className="pt-xl">
        <Button size="lg" fullWidth className="rounded-full" rightIcon="arrowRight" onPress={onBook}>
          New booking
        </Button>
      </View>
    </>
  );
}

function NotFound({ theme }: { theme: Theme }) {
  return (
    <Typography variant="body-md" color={theme.inkMuted} style={{ paddingTop: 16 }}>
      Customer not found.
    </Typography>
  );
}
