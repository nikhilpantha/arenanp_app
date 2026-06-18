import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { OfferForm } from '@/components/venue/offers/OfferForm';
import { useCreateOffer } from '@/lib/api/venue-offers';

export default function NewOfferScreen() {
  const router = useRouter();
  const createOffer = useCreateOffer();

  return (
    <OfferForm
      title="New offer"
      submitLabel="Create offer"
      submitting={createOffer.isPending}
      onBack={() => router.back()}
      onSubmit={(draft) =>
        createOffer.mutate(draft, {
          onSuccess: () => router.back(),
          onError: (e) =>
            Alert.alert('Could not create offer', e instanceof Error ? e.message : 'Please try again.'),
        })
      }
    />
  );
}
