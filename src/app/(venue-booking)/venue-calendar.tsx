import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, ScreenHeader } from '@/components/common';
import { CalendarTab } from '@/components/venue/bookings/CalendarTab';
import { type Scope, SportScope } from '@/components/venue/bookings/SportScope';
import { BOOKING_SPORTS } from '@/data/venue-bookings';

/** Full booking calendar for the venue — opened from the header calendar action. */
export default function VenueCalendarScreen() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>('all');

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Booking calendar" onBack={() => router.back()} />
      </View>
      <View className="gap-lg pt-md">
        <SportScope sports={BOOKING_SPORTS} value={scope} onChange={setScope} />
        <CalendarTab scope={scope} />
      </View>
    </Screen>
  );
}
