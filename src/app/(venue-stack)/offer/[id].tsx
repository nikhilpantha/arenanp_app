import { ActivityIndicator, Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, Screen, ScreenHeader, Typography } from '@/components/common';
import { OfferForm } from '@/components/venue/offers/OfferForm';
import { useTheme } from '@/hooks/use-theme';
import { useDeleteOffer, useUpdateOffer, useVenueOffer } from '@/lib/api/venue-offers';

export default function EditOfferScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const offerQ = useVenueOffer(id);
  const offer = offerQ.data;
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  if (offerQ.isLoading) {
    return (
      <Screen scroll>
        <View className="pt-sm">
          <ScreenHeader title="Offer" onBack={() => router.back()} />
        </View>
        <View className="items-center justify-center pt-xl">
          <ActivityIndicator color={theme.primary} />
        </View>
      </Screen>
    );
  }

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

  const paused = !offer.isActive;
  const busy = updateOffer.isPending || deleteOffer.isPending;

  const confirmDelete = () =>
    Alert.alert('Delete offer?', offer.title, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteOffer.mutate(offer.id, {
            onSuccess: () => router.back(),
            onError: (e) =>
              Alert.alert('Could not delete', e instanceof Error ? e.message : 'Please try again.'),
          }),
      },
    ]);

  return (
    <OfferForm
      title="Edit offer"
      initial={offer}
      submitLabel="Save changes"
      submitting={updateOffer.isPending}
      onBack={() => router.back()}
      onSubmit={(draft) =>
        updateOffer.mutate(
          { offerId: offer.id, patch: draft },
          {
            onSuccess: () => router.back(),
            onError: (e) =>
              Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.'),
          },
        )
      }
      below={
        <View className="gap-sm pt-xl">
          <Button
            variant="tertiary"
            size="lg"
            fullWidth
            className="rounded-full"
            leftIcon={paused ? 'check' : 'ban'}
            disabled={busy}
            onPress={() =>
              updateOffer.mutate(
                { offerId: offer.id, patch: { isActive: paused } },
                {
                  onSuccess: () => router.back(),
                  onError: (e) =>
                    Alert.alert('Could not update', e instanceof Error ? e.message : 'Please try again.'),
                },
              )
            }>
            {paused ? 'Resume offer' : 'Pause offer'}
          </Button>
          <Button variant="ghost" size="lg" fullWidth disabled={busy} onPress={confirmDelete}>
            Delete offer
          </Button>
        </View>
      }
    />
  );
}
