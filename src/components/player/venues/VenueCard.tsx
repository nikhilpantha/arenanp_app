import { View } from 'react-native';
import { Image } from 'expo-image';

import { Card, Icon, SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { VenueCardData } from '@/lib/api/discovery';
import { formatTime } from '@/lib/subscription-format';
import { isOpenNow } from '@/lib/time';

const MAX_SPORTS = 3;

/**
 * A venue tile: 16:9 cover with an Open/Closed tag, name + location, sports, and a
 * footer row pairing the opening hours (left) with a bold price (right).
 */
export function VenueCard({ venue, onPress }: { venue: VenueCardData; onPress?: () => void }) {
  const theme = useTheme();
  const location = venue.city ?? venue.address;
  const extraSports = venue.sports.length - MAX_SPORTS;
  const open = isOpenNow(venue.openTime, venue.closeTime);

  return (
    <Card elevation="md" onPress={onPress} className="overflow-hidden" style={{ padding: 0 }}>
      {/* Fixed 16:9 frame keeps every card identical regardless of the source image size. */}
      <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: theme.cardSunken }}>
        {venue.coverImageUrl ? (
          <Image source={{ uri: venue.coverImageUrl }} style={{ flex: 1 }} contentFit="cover" transition={200} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Icon name="building" size={30} color={theme.inkMuted} />
          </View>
        )}
        {/* Open / Closed status as a tag, floated over the photo. */}
        <View
          className="absolute right-2 top-2 rounded-full px-sm py-[3px]"
          style={{ backgroundColor: open ? theme.success : theme.danger }}>
          <Typography variant="label-sm" color="#ffffff">
            {open ? 'Open' : 'Closed'}
          </Typography>
        </View>
      </View>

      <View className="gap-sm p-md">
        {/* Name (left) paired with the price (right) — same size so neither out-shouts the other. */}
        <View className="flex-row items-baseline justify-between gap-md">
          <Typography variant="label-lg" numberOfLines={1} style={{ flex: 1 }}>
            {venue.name}
          </Typography>
          {venue.priceFrom != null ? (
            <View className="flex-row items-baseline gap-[2px]">
              <Typography variant="label-lg" color={theme.primary}>
                Rs {venue.priceFrom}
              </Typography>
              <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                /hr
              </Typography>
            </View>
          ) : null}
        </View>

        {/* Location (left) + opening hours (right) — matched size + muted tone. */}
        <View className="flex-row items-center justify-between gap-md">
          <View className="flex-1 flex-row items-center gap-xs">
            <Icon name="mapPin" size={14} color={theme.inkMuted} />
            <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1} style={{ flex: 1 }}>
              {location ?? 'Location'}
            </Typography>
          </View>
          <View className="flex-row items-center gap-xs">
            <Icon name="clock" size={14} color={theme.inkMuted} />
            <Typography variant="body-md" color={theme.inkMuted} style={{ textTransform: 'none' }}>
              {formatTime(venue.openTime)}–{formatTime(venue.closeTime)}
            </Typography>
          </View>
        </View>

        {/* Sports as clean outlined chips (no grey fill) so the names read clearly. */}
        <View className="flex-row flex-wrap items-center gap-xs pt-xs">
          {venue.sports.slice(0, MAX_SPORTS).map((s) => (
            <View
              key={s.slug}
              className="flex-row items-center gap-xs rounded-full px-sm py-[3px]"
              style={{ borderWidth: 1, borderColor: theme.border }}>
              <SportGlyph slug={s.slug} size={16} />
              <Typography variant="label-sm" color={theme.ink} style={{ textTransform: 'none' }}>
                {s.name}
              </Typography>
            </View>
          ))}
          {extraSports > 0 ? (
            <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
              +{extraSports} more
            </Typography>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
