import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

import { Icon, Typography } from '@/components/common';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';
import { staticMapUrl } from '@/lib/places';

import { type LocationPickerProps } from './location-picker.types';

/**
 * Fallback for when the native maps module isn't in the build (e.g. Expo Go). The owner
 * picks their venue via the Google Places search; this renders a static map image of the
 * selected point, or a tidy placeholder if the Static Maps API isn't available. Renders
 * nothing until a location is chosen.
 */
export default function ManualLocationPicker({ latitude, longitude, address }: LocationPickerProps) {
  const theme = useTheme();
  const { accent } = useAccent();
  const [imageFailed, setImageFailed] = useState(false);

  if (latitude == null || longitude == null) return null;

  const url = staticMapUrl(latitude, longitude, { zoom: 16 });

  if (url && !imageFailed) {
    return (
      <View
        className="flex-1 overflow-hidden rounded-3xl"
        style={{ minHeight: 220, backgroundColor: theme.cardMuted }}>
        <Image
          source={{ uri: url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          onError={() => setImageFailed(true)}
        />
      </View>
    );
  }

  // No live map image — show a clean confirmation of the picked spot instead.
  return (
    <View
      className="flex-1 items-center justify-center gap-sm rounded-3xl p-lg"
      style={{ minHeight: 220, backgroundColor: theme.cardMuted }}>
      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}1A` }}>
        <Icon name="mapPin" size={26} color={accent} />
      </View>
      <Typography variant="label-lg" color={theme.ink}>
        Location selected
      </Typography>
      {address ? (
        <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
          {address}
        </Typography>
      ) : null}
      <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Typography>
    </View>
  );
}
