import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Screen, ScreenHeader, Typography } from '@/components/common';
import { CustomerInsights } from '@/components/venue/CustomerInsights';
import { CustomerHeaderCard } from '@/components/venue/customers/CustomerHeaderCard';
import { LoyaltyProgress } from '@/components/venue/LoyaltyProgress';
import { CUSTOMERS } from '@/data/customers';
import { useTheme } from '@/hooks/use-theme';

export default function CustomerDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customer = CUSTOMERS.find((c) => c.id === id);

  if (!customer) {
    return (
      <Screen scroll>
        <View className="pt-sm">
          <ScreenHeader title="Customer" onBack={() => router.back()} />
        </View>
        <Typography variant="body-md" color={theme.inkMuted} style={{ paddingTop: 16 }}>
          Customer not found.
        </Typography>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Customer" onBack={() => router.back()} />
      </View>

      <View className="mt-md gap-md">
        <CustomerHeaderCard customer={customer} onCall={() => Alert.alert('Calling…', customer.phone)} />
        <CustomerInsights customer={customer} />
        <LoyaltyProgress gamesPlayed={customer.gamesPlayed} />
      </View>

      <View className="pt-xl">
        <Button size="lg" fullWidth className="rounded-full" rightIcon="arrowRight" onPress={() => router.push('/new-booking')}>
          New booking
        </Button>
      </View>
    </Screen>
  );
}
