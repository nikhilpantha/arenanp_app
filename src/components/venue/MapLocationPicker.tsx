import { type ComponentRef, useCallback, useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { AppleMaps, GoogleMaps } from 'expo-maps';

import { Icon, Typography } from '@/components/common';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';
import { reverseGeocode } from '@/lib/geocode';

import {
  DEFAULT_REGION,
  DEFAULT_ZOOM,
  type LocationPickerProps,
} from './location-picker.types';

const GEOCODE_DEBOUNCE_MS = 500;

type MapHandle = ComponentRef<typeof GoogleMaps.View> | ComponentRef<typeof AppleMaps.View>;

export default function MapLocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const theme = useTheme();
  const { accent } = useAccent();
  const mapRef = useRef<MapHandle>(null);
  const coordsRef = useRef({
    latitude: latitude ?? DEFAULT_REGION.latitude,
    longitude: longitude ?? DEFAULT_REGION.longitude,
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recenter when the selected coords change externally (e.g. Places search). Guarded by
  // an epsilon so the camera-move → onChange → prop-update cycle doesn't loop.
  useEffect(() => {
    if (latitude == null || longitude == null) return;
    const dLat = Math.abs(latitude - coordsRef.current.latitude);
    const dLng = Math.abs(longitude - coordsRef.current.longitude);
    if (dLat < 1e-5 && dLng < 1e-5) return;
    coordsRef.current = { latitude, longitude };
    mapRef.current?.setCameraPosition({ coordinates: { latitude, longitude }, zoom: DEFAULT_ZOOM });
  }, [latitude, longitude]);

  const resolveAndEmit = useCallback(
    async (lat: number, lng: number) => {
      const address = await reverseGeocode(lat, lng);
      onChange({ latitude: lat, longitude: lng, address });
    },
    [onChange],
  );

  const handleCameraMove = useCallback(
    (coordinates?: { latitude?: number; longitude?: number }) => {
      if (coordinates?.latitude == null || coordinates?.longitude == null) return;
      coordsRef.current = { latitude: coordinates.latitude, longitude: coordinates.longitude };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        resolveAndEmit(coordsRef.current.latitude, coordsRef.current.longitude);
      }, GEOCODE_DEBOUNCE_MS);
    },
    [resolveAndEmit],
  );

  const initialCamera = {
    coordinates: {
      latitude: latitude ?? DEFAULT_REGION.latitude,
      longitude: longitude ?? DEFAULT_REGION.longitude,
    },
    zoom: DEFAULT_ZOOM,
  };

  return (
    <View className="overflow-hidden rounded-3xl" style={styles.wrap}>
      {Platform.OS === 'ios' ? (
        <AppleMaps.View
          ref={mapRef as React.Ref<ComponentRef<typeof AppleMaps.View>>}
          style={StyleSheet.absoluteFill}
          cameraPosition={initialCamera}
          onCameraMove={(e) => handleCameraMove(e.coordinates)}
        />
      ) : (
        <GoogleMaps.View
          ref={mapRef as React.Ref<ComponentRef<typeof GoogleMaps.View>>}
          style={StyleSheet.absoluteFill}
          cameraPosition={initialCamera}
          onCameraMove={(e) => handleCameraMove(e.coordinates)}
        />
      )}

      {/* Fixed center pin — the map slides under it; its tip marks the selected point. */}
      <View pointerEvents="none" style={styles.pinWrap}>
        <Icon name="mapPin" size={40} color={accent} />
      </View>

      {/* Hint chip: the only way to set the point is moving the map under the pin. */}
      <View pointerEvents="none" style={[styles.hint, { backgroundColor: theme.card }, Shadow.sm]}>
        <Icon name="mapPin" size={15} color={accent} />
        <Typography variant="label-sm" color={theme.ink} style={{ textTransform: 'none' }}>
          Drag the map to position the pin
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 280 },
  pinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  hint: {
    position: 'absolute',
    top: Spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
});
