import { Icon as TabIcon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

// All tabs are visible to the venue owner by default. There is no "under review"
// gate: a freshly-created venue is PENDING (it just won't appear in public
// listings until a super admin approves it), but the owner always has full
// dashboard access.
const TABS = [
  { name: 'dashboard', label: 'Dashboard', sf: 'square.grid.2x2.fill', drawable: 'home' },
  { name: 'bookings', label: 'Bookings', sf: 'calendar', drawable: 'bookings' },
  { name: 'customers', label: 'Customers', sf: 'person.2.fill', drawable: 'customers' },
  { name: 'finance', label: 'Finance', sf: 'creditcard.fill', drawable: 'earnings' },
  { name: 'venues', label: 'Venues', sf: 'building.2.fill', drawable: 'profile' },
] as const;

export default function VenueTabsLayout() {
  return (
    <NativeTabs
      blurEffect="none"
      backgroundColor={Colors.light.card}
      tintColor={Colors.light.ink}
      indicatorColor={Colors.light.border}
      labelStyle={{ selected: { color: Colors.light.ink } }}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Label>{tab.label}</Label>
          <TabIcon sf={tab.sf} drawable={tab.drawable} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
