import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

const TABS = [
  { name: 'index', label: 'Home', sf: 'house.fill', drawable: 'home' },
  { name: 'venues', label: 'Venues', sf: 'building.2.fill', drawable: 'venues' },
  { name: 'leagues', label: 'Leagues', sf: 'trophy.fill', drawable: 'leagues' },
  { name: 'profile', label: 'Profile', sf: 'person.crop.circle.fill', drawable: 'profile' },
] as const;

export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor={Colors.light.card}
      indicatorColor={Colors.light.primary}
      labelStyle={{ selected: { color: Colors.light.primary } }}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Label>{tab.label}</Label>
          <Icon sf={tab.sf} drawable={tab.drawable} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
