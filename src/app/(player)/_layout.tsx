import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/theme';

// One icon set for both platforms: Ionicons rendered through expo-router's `VectorIcon`
// and passed as the cross-platform `src` (outline when idle, filled when selected). This
// looks identical on iOS and Android — SF Symbols are iOS-only and never match Android.
const TABS = [
  { name: 'index', label: 'Home', icon: 'home-outline', active: 'home' },
  { name: 'venues', label: 'Venues', icon: 'business-outline', active: 'business' },
  { name: 'clan', label: 'Clan', icon: 'people-outline', active: 'people' },
  { name: 'my-games', label: 'My Games', icon: 'football-outline', active: 'football' },
  { name: 'profile', label: 'Profile', icon: 'person-circle-outline', active: 'person-circle' },
] as const;

export default function TabsLayout() {
  return (
    <NativeTabs
      // Solid white bar; the selected icon + label are primary-tinted. On Android the
      // Material 3 active-indicator pill sits *behind* the selected icon, so it must NOT
      // also be primary — a green icon on a green pill is invisible. Use a pale primary
      // tint for the pill. blurEffect="none" keeps the white opaque (no translucent blur).
      blurEffect="none"
      backgroundColor={Colors.light.card}
      tintColor={Colors.light.primary}
      indicatorColor="rgba(16, 185, 129, 0.16)"
      labelStyle={{ selected: { color: Colors.light.primary } }}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Label>{tab.label}</Label>
          <Icon
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
