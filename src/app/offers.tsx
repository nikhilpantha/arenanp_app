import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Screen, ScreenHeader, Typography } from '@/components/common';
import { OffersList } from '@/components/venue/offers/OffersList';
import { useTheme } from '@/hooks/use-theme';
import { useOfferStore } from '@/stores';

export default function OffersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const offers = useOfferStore((s) => s.offers);
  const claims = useOfferStore((s) => s.claims);

  const activeCount = offers.filter((o) => o.status === 'active').length;
  const availableClaims = claims.filter((c) => c.status === 'available').length;

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Offers" onBack={() => router.back()} />
      </View>

      <View className="flex-row gap-sm pt-md">
        <Stat value={String(activeCount)} label="Active offers" />
        <Stat value={String(availableClaims)} label="Claimed, unused" tint={theme.secondaryDark} />
      </View>

      <View className="pt-md">
        <Button size="lg" fullWidth leftIcon="plus" className="rounded-full" onPress={() => router.push('/offer/new')}>
          New offer
        </Button>
      </View>

      <View className="pt-xl">
        <OffersList offers={offers} onOpen={(id) => router.push({ pathname: '/offer/[id]', params: { id } })} />
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
