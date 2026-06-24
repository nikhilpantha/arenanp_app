import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Badge, Screen, Typography } from '@/components/common';
import { AddVenueCard } from '@/components/venue/dashboard/AddVenueCard';
import { QuickActions } from '@/components/venue/dashboard/QuickActions';
import { RecurringSlots } from '@/components/venue/dashboard/RecurringSlots';
import { TodayHero } from '@/components/venue/dashboard/TodayHero';
import { TopTeams } from '@/components/venue/dashboard/TopTeams';
import { UpNext } from '@/components/venue/dashboard/UpNext';
import { WeeklyPerformance } from '@/components/venue/dashboard/WeeklyPerformance';
import { VenueHeader } from '@/components/venue/VenueHeader';
import { VENUE_STATUS_BADGE, VenueSwitcherSheet } from '@/components/venue/VenueSwitcherSheet';
import { useTheme } from '@/hooks/use-theme';
import { useDisplayUri } from '@/lib/api/uploads';
import { primaryVenueMembership } from '@/lib/panels';
import { useActiveVenueStore, useAuthStore } from '@/stores';

export default function VenueDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const activeVenueId = useActiveVenueStore((s) => s.activeVenueId);
  const name = profile?.fullName ?? 'Venue';
  const avatarUri = useDisplayUri(profile?.avatarUrl);
  const memberships = profile?.venueMemberships ?? [];
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const openAccount = () => router.push('/venue-account');

  // No venue yet — the owner has the capability but hasn't created a venue.
  if (memberships.length === 0) {
    return (
      <Screen scroll tabBarSafe>
        <VenueHeader
          avatarName={name}
          avatarSrc={avatarUri}
          eyebrow="Welcome back"
          title="Your venues"
          onAvatarPress={openAccount}
        />
        <AddVenueCard />
      </Screen>
    );
  }

  const active =
    memberships.find((m) => m.venueId === activeVenueId) ??
    primaryVenueMembership(profile) ??
    memberships[0];
  const status = VENUE_STATUS_BADGE[active.verificationStatus] ?? VENUE_STATUS_BADGE.NOT_REQUESTED;

  return (
    <Screen scroll tabBarSafe>
      <VenueHeader
        avatarName={name}
        avatarSrc={avatarUri}
        eyebrow="Welcome back"
        title={active.venueName}
        onTitlePress={() => setSwitcherOpen(true)}
        onAvatarPress={openAccount}
      />
      {active.verificationStatus !== 'APPROVED' ? (
        <View className="flex-row items-center gap-sm pb-md">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
            Not shown in listings until approved
          </Typography>
        </View>
      ) : null}

      <TodayHero />
      <QuickActions />
      <UpNext />
      <RecurringSlots />
      <TopTeams />
      <WeeklyPerformance />

      <VenueSwitcherSheet visible={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </Screen>
  );
}
