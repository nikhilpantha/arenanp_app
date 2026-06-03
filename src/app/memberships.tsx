import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, ScreenHeader } from '@/components/common';
import { MembersSection } from '@/components/venue/bookings/MembersSection';

export default function MembershipsScreen() {
  const router = useRouter();

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Membership plans" onBack={() => router.back()} />
      </View>
      <View className="pt-md">
        <MembersSection
          onAddTier={() => router.push('/membership/new')}
          // Membership is team-first: pick/add a team, then book the monthly plan.
          onAddMember={() => router.push('/membership/book')}
          onOpenMember={(id) => router.push({ pathname: '/member/[id]', params: { id } })}
        />
      </View>
    </Screen>
  );
}
