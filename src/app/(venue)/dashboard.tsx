import { Screen } from '@/components/common';
import { QuickActions } from '@/components/venue/dashboard/QuickActions';
import { RecurringSlots } from '@/components/venue/dashboard/RecurringSlots';
import { TodayHero } from '@/components/venue/dashboard/TodayHero';
import { TopTeams } from '@/components/venue/dashboard/TopTeams';
import { UpNext } from '@/components/venue/dashboard/UpNext';
import { WeeklyPerformance } from '@/components/venue/dashboard/WeeklyPerformance';
import { VenueHeader } from '@/components/venue/VenueHeader';
import { VENUE_NAME } from '@/data/dashboard';
import { useAuthStore } from '@/stores';

export default function OwnerDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const name = profile?.fullName ?? 'Owner';

  return (
    <Screen scroll tabBarSafe>
      <VenueHeader avatarName={name} eyebrow="Welcome back" title={VENUE_NAME} />
      <TodayHero />
      <QuickActions />
      <UpNext />
      <RecurringSlots />
      <TopTeams />
      <WeeklyPerformance />
    </Screen>
  );
}
