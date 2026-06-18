import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Screen, ScreenHeader, Typography } from '@/components/common';
import { VenueOffersList } from '@/components/venue/offers/VenueOffersList';
import { useTheme } from '@/hooks/use-theme';
import { useVenueOffers } from '@/lib/api/venue-offers';

export default function OffersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const offersQ = useVenueOffers();
  const offers = offersQ.data ?? [];

  const activeCount = offers.filter((o) => o.isActive).length;
  const loyaltyCount = offers.filter((o) => o.trigger === 'EVERY_NTH').length;

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Offers" onBack={() => router.back()} />
      </View>

      <View className="flex-row gap-sm pt-md">
        <Stat value={String(activeCount)} label="Active offers" />
        <Stat value={String(loyaltyCount)} label="Loyalty rewards" tint={theme.secondaryDark} />
      </View>

      <View className="pt-md">
        <Button size="lg" fullWidth leftIcon="plus" className="rounded-full" onPress={() => router.push('/offer/new')}>
          New offer
        </Button>
      </View>

      <View className="pt-xl">
        <VenueOffersList
          offers={offers}
          loading={offersQ.isLoading}
          onOpen={(id) => router.push({ pathname: '/offer/[id]', params: { id } })}
        />
      </View>
    </Screen>
  );
}

function Stat({ value, label, tint }: { value: string; label: string; tint?: string }) {
  const theme = useTheme();
  return (
    <Card elevation="sm" className="flex-1 gap-[2px]">
      <Typography variant="headline-md" color={tint}>
        {value}
      </Typography>
      <Typography variant="label-sm" color={theme.inkMuted}>
        {label}
      </Typography>
    </Card>
  );
}
