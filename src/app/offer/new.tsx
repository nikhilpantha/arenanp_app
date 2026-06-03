import { useRouter } from 'expo-router';

import { OfferForm } from '@/components/venue/offers/OfferForm';
import { useOfferStore } from '@/stores';

export default function NewOfferScreen() {
  const router = useRouter();
  const addOffer = useOfferStore((s) => s.addOffer);

  return (
    <OfferForm
      title="New offer"
      submitLabel="Create offer"
      onBack={() => router.back()}
      onSubmit={(draft) => {
        addOffer({ id: `of-${Date.now()}`, status: 'active', ...draft });
        router.back();
      }}
    />
  );
}
