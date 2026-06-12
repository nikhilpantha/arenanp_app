import { View } from 'react-native';
import { Image } from 'expo-image';

import { useTheme } from '@/hooks/use-theme';
import { useSportBySlug } from '@/lib/api/sports';

import { Typography } from './Typography';

export interface SportGlyphProps {
  /** Sport slug to resolve against the catalogue. */
  slug: string;
  /** Square size in px (default 22). */
  size?: number;
}

/**
 * The visual for a sport: its uploaded icon (presigned) when available, else a
 * neutral box with the sport's initial. Reads the cached sports catalogue, so it
 * stays in sync with what the admin manages — no hardcoded emoji.
 */
export function SportGlyph({ slug, size = 22 }: SportGlyphProps) {
  const theme = useTheme();
  const sport = useSportBySlug(slug);
  const radius = Math.round(size * 0.28);

  if (sport?.iconUrl) {
    return (
      <Image
        source={{ uri: sport.iconUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
      />
    );
  }

  const initial = (sport?.name ?? slug ?? '?').charAt(0).toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: theme.cardMuted,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Typography variant="label-sm" color={theme.inkMuted}>
        {initial}
      </Typography>
    </View>
  );
}
