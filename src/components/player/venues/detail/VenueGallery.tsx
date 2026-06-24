import { useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

const HEIGHT = 220;

/** Full-bleed paged photo carousel with page dots; a placeholder when there are none. */
export function VenueGallery({ images, sportsCount }: { images: string[]; sportsCount?: number }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);

  if (images.length === 0) {
    return (
      <View
        className="items-center justify-center gap-xs rounded-3xl"
        style={{ height: HEIGHT, backgroundColor: theme.cardSunken }}>
        <Icon name="building" size={36} color={theme.inkMuted} />
        <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
          {sportsCount ? `${sportsCount} sports` : 'No photos yet'}
        </Typography>
      </View>
    );
  }

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View className="gap-sm">
      <View
        className="overflow-hidden rounded-3xl"
        style={{ height: HEIGHT, backgroundColor: theme.cardSunken }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onEnd}>
          {width > 0
            ? images.map((uri) => (
                <Image
                  key={uri}
                  source={{ uri }}
                  style={{ width, height: HEIGHT }}
                  contentFit="cover"
                  transition={200}
                />
              ))
            : null}
        </ScrollView>
      </View>

      {images.length > 1 ? (
        <View className="flex-row items-center justify-center gap-xs">
          {images.map((uri, i) => (
            <View
              key={uri}
              className="h-1.5 rounded-full"
              style={{ width: i === page ? 16 : 6, backgroundColor: i === page ? theme.primary : theme.border }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
