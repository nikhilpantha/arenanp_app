import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, ScreenHeader } from '@/components/common';
import { MembersSection } from '@/components/venue/bookings/MembersSection';
import { MembersSectionLive } from '@/components/venue/bookings/MembersSectionLive';
import { useSubscriptionsApiEnabled } from '@/lib/api/subscriptions';

export default function MembershipsScreen() {
  const router = useRouter();
  const apiEnabled = useSubscriptionsApiEnabled();

  const onAddTier = () => router.push('/membership/new');
  const onAddMember = () => router.push('/membership/book');

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Membership plans" onBack={() => router.back()} />
      </View>
      <View className="pt-md">
        {apiEnabled ? (
          <MembersSectionLive
            onAddTier={onAddTier}
            onAddMember={onAddMember}
            onViewMembers={() => router.push('/membership/members')}
            onOpenMember={(id) => router.push({ pathname: '/member/[id]' as const, params: { id } })}
            onOpenPlan={(id) =>
              router.push({ pathname: '/membership/plan/[id]' as const, params: { id } })
            }
          />
        ) : (
          <MembersSection
            onAddTier={onAddTier}
            onAddMember={onAddMember}
            onOpenMember={(id) => router.push({ pathname: '/member/[id]' as const, params: { id } })}
          />
        )}
      </View>
    </Screen>
  );
}
