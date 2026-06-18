import { Icon as TabIcon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/theme';

// All tabs are visible to the venue owner by default. There is no "under review"
// gate: a freshly-created venue is PENDING (it just won't appear in public
// listings until a super admin approves it), but the owner always has full
// dashboard access.
//
// One icon set for both platforms: Ionicons via expo-router's `VectorIcon`, passed as the
// cross-platform `src` (outline when idle, filled when selected) so iOS and Android match.
const TABS = [
  { name: 'dashboard', label: 'Dashboard', icon: 'grid-outline', active: 'grid' },
  { name: 'bookings', label: 'Bookings', icon: 'calendar-outline', active: 'calendar' },
  { name: 'customers', label: 'Customers', icon: 'people-outline', active: 'people' },
  { name: 'finance', label: 'Finance', icon: 'card-outline', active: 'card' },
  { name: 'venues', label: 'Venues', icon: 'business-outline', active: 'business' },
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
          <TabIcon
            src={{
              default: <VectorIcon family={Ionicons} name={tab.icon} />,
              selected: <VectorIcon family={Ionicons} name={tab.active} />,
            }}
          />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
