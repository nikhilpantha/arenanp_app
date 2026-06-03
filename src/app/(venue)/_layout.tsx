import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

const TABS = [
  { name: 'dashboard', label: 'Dashboard', sf: 'square.grid.2x2.fill', drawable: 'home' },
  { name: 'bookings', label: 'Bookings', sf: 'calendar', drawable: 'bookings' },
  { name: 'customers', label: 'Customers', sf: 'person.2.fill', drawable: 'customers' },
  { name: 'finance', label: 'Finance', sf: 'creditcard.fill', drawable: 'earnings' },
  { name: 'profile', label: 'Profile', sf: 'person.crop.circle.fill', drawable: 'profile' },
] as const;

export default function VenueTabsLayout() {
  return (
    <NativeTabs
      // Clean white bar with a neutral active tab (dark ink), inactive gray, and a soft
      // gray Android indicator — no green accents. blurEffect="none" keeps the white opaque.
      // To bring back the green active tab, set tintColor/indicator/selected back to primary.
      blurEffect="none"
      backgroundColor={Colors.light.card}
      tintColor={Colors.light.ink}
      indicatorColor={Colors.light.border}
      labelStyle={{ selected: { color: Colors.light.ink } }}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Label>{tab.label}</Label>
          <Icon sf={tab.sf} drawable={tab.drawable} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
