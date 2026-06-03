import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Screen, ScreenHeader, Typography } from '@/components/common';
import { OfferForm } from '@/components/venue/offers/OfferForm';
import { useTheme } from '@/hooks/use-theme';
import { useOfferStore } from '@/stores';

export default function EditOfferScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const offer = useOfferStore((s) => s.offers.find((o) => o.id === id));
  const updateOffer = useOfferStore((s) => s.updateOffer);
  const toggleOfferStatus = useOfferStore((s) => s.toggleOfferStatus);
  const removeOffer = useOfferStore((s) => s.removeOffer);

  if (!offer) {
    return (
      <Screen scroll>
        <View className="pt-sm">
          <ScreenHeader title="Offer" onBack={() => router.back()} />
        </View>
        <Typography variant="body-md" color={theme.inkMuted} style={{ paddingTop: 16 }}>
          Offer not found.
        </Typography>
      </Screen>
    );
  }

  const paused = offer.status !== 'active';

  const confirmDelete = () =>
    Alert.alert('Delete offer?', offer.title, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeOffer(offer.id);
          router.back();
        },
      },
    ]);

  return (
    <OfferForm
      title="Edit offer"
      initial={offer}
      submitLabel="Save changes"
      onBack={() => router.back()}
      onSubmit={(draft) => {
        updateOffer(offer.id, draft);
        router.back();
      }}
      below={
        <View className="gap-sm pt-xl">
          <Button
            variant="tertiary"
            size="lg"
            fullWidth
            className="rounded-full"
            leftIcon={paused ? 'check' : 'ban'}
            onPress={() => {
              toggleOfferStatus(offer.id);
              router.back();
            }}>
            {paused ? 'Resume offer' : 'Pause offer'}
          </Button>
          <Button variant="ghost" size="lg" fullWidth onPress={confirmDelete}>
            Delete offer
          </Button>
        </View>
      }
    />
  );
}
