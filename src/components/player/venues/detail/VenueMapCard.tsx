import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';

import { Button, Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { openInMaps } from '@/lib/maps';
import { staticMapUrl } from '@/lib/places';

/**
 * Location card: a Google static map preview above a tappable address row and a clear
 * "Get directions" button — both open the venue in Google Maps. Degrades to just the
 * address row when there's no map image, and renders nothing without coords or address.
 */
export function VenueMapCard({
  latitude,
  longitude,
  address,
}: {
  latitude?: number;
  longitude?: number;
  address?: string;
}) {
  const theme = useTheme();
  const hasCoords = latitude != null && longitude != null;
  if (!hasCoords && !address) return null;

  const mapUrl = hasCoords ? staticMapUrl(latitude, longitude, { width: 640, height: 280 }) : null;
  const open = () => {
    if (hasCoords) openInMaps(latitude, longitude);
  };

  return (
    <Card elevation="sm" className="overflow-hidden" style={{ padding: 0 }}>
      {mapUrl ? (
        <Pressable onPress={open} disabled={!hasCoords} accessibilityRole="button" accessibilityLabel="Open in Maps">
          <Image source={{ uri: mapUrl }} style={{ width: '100%', height: 150 }} contentFit="cover" />
        </Pressable>
      ) : null}

      <View className="gap-md p-md">
        {/* Tappable address — opens Maps. */}
        <Pressable
          onPress={open}
          disabled={!hasCoords}
          accessibilityRole="button"
          className="flex-row items-center gap-md">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${theme.primary}14` }}>
            <Icon name="mapPin" size={20} color={theme.primary} />
          </View>
          <View className="flex-1 gap-[2px]">
            <Typography variant="label-md" numberOfLines={2}>
              {address ?? 'View on map'}
            </Typography>
            {hasCoords ? (
              <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                Tap to open in Google Maps
              </Typography>
            ) : null}
          </View>
        </Pressable>

        {hasCoords ? (
          <Button
            size="md"
            variant="secondary"
            fullWidth
            leftIcon="navigation"
            className="rounded-full"
            onPress={open}>
            Get directions
          </Button>
        ) : null}
      </View>
    </Card>
  );
}
