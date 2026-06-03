import { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

import { useTheme } from '@/hooks/use-theme';

import { type LocationPickerProps } from './location-picker.types';
import ManualLocationPicker from './ManualLocationPicker';

// expo-maps requires a native build; in Expo Go (or an un-rebuilt dev client) the
// module is absent. Check first so importing expo-maps never crashes the screen.
export const mapsAvailable = requireOptionalNativeModule('ExpoMaps') != null;

// Lazily loaded so `expo-maps` is only imported when the native module exists.
const MapLocationPicker = lazy(() => import('./MapLocationPicker'));

export type { LocationPickerProps, PickedLocation } from './location-picker.types';

export function LocationPicker(props: LocationPickerProps) {
  const theme = useTheme();

  if (!mapsAvailable) return <ManualLocationPicker {...props} />;

  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center rounded-3xl" style={{ minHeight: 280 }}>
          <ActivityIndicator color={theme.primary} />
        </View>
      }>
      <MapLocationPicker {...props} />
    </Suspense>
  );
}
