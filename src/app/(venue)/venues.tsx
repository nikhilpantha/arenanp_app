import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/common';
import { ProfileSection } from '@/components/venue/profile/ProfileSection';
import { VenueIdentityCard } from '@/components/venue/profile/VenueIdentityCard';
import { VenueHeader } from '@/components/venue/VenueHeader';
import { VenueSwitcherSheet } from '@/components/venue/VenueSwitcherSheet';
import { MANAGE_ROWS, type ProfileRowItem } from '@/data/venue-profile';
import { useRefresh } from '@/hooks/use-refresh';
import { mapApiVenueToForm, useMyVenue } from '@/lib/api/venue';
import { useVenueStore } from '@/stores';

/**
 * "Venues" tab — management for the selected venue. The identity card switches
 * the active venue (bottom sheet); "Manage venue" rows edit its profile/services.
 * Account settings, panel switching and sign-out live on the account page reached
 * from the dashboard header.
 */
export default function VenueVenues() {
  const router = useRouter();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Hydrate the venue store from the backend (drives the identity card + edit forms).
  const myVenueQ = useMyVenue();
  const { refreshing, onRefresh } = useRefresh(myVenueQ);
  const hydrateVenue = useVenueStore((s) => s.hydrate);
  useEffect(() => {
    if (myVenueQ.data) {
      hydrateVenue(mapApiVenueToForm(myVenueQ.data), {
        venueId: myVenueQ.data.id,
        verificationStatus: myVenueQ.data.verificationStatus,
      });
    }
  }, [myVenueQ.data, hydrateVenue]);

  const onManagePress = (row: ProfileRowItem) => {
    if (row.href) router.push(row.href);
    else if (row.section)
      router.push({ pathname: '/venue-edit/[section]', params: { section: row.section } });
  };

  return (
    <Screen scroll tabBarSafe refreshing={refreshing} onRefresh={onRefresh}>
      <VenueHeader title="Venues" />

      <VenueIdentityCard onPress={() => setSwitcherOpen(true)} />

      <ProfileSection title="Manage venue" rows={MANAGE_ROWS} onRowPress={onManagePress} />

      <VenueSwitcherSheet visible={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </Screen>
  );
}
