import { Linking, Pressable, View } from 'react-native';

import { Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { VenueDetailData } from '@/lib/api/discovery';

const plural = (n: number, one: string) => `${n} ${n === 1 ? one : `${one}s`}`;

/** Venue title block: name, location, hours and a concise facts line. */
export function VenueOverview({ venue }: { venue: VenueDetailData }) {
  const theme = useTheme();
  const location = [venue.address, venue.city].filter(Boolean).join(', ');

  const facts: string[] = [];
  if (venue.sports.length) facts.push(plural(venue.sports.length, 'sport'));
  if (venue.courts.length) facts.push(plural(venue.courts.length, 'court'));
  if (venue.priceFrom != null) facts.push(`From Rs ${venue.priceFrom}`);

  return (
    <View className="gap-sm">
      <Typography variant="headline-lg">{venue.name}</Typography>

      {location ? (
        <View className="flex-row items-center gap-xs">
          <Icon name="mapPin" size={15} color={theme.inkMuted} />
          <Typography variant="body-md" color={theme.inkMuted} style={{ flex: 1 }}>
            {location}
          </Typography>
        </View>
      ) : null}

      <View className="flex-row items-center gap-xs">
        <Icon name="clock" size={15} color={theme.inkMuted} />
        <Typography variant="body-md" color={theme.inkMuted}>
          Open {venue.openTime}–{venue.closeTime}
        </Typography>
      </View>

      {venue.contactPhone ? (
        <Pressable
          onPress={() => Linking.openURL(`tel:${venue.contactPhone}`).catch(() => undefined)}
          accessibilityRole="button"
          accessibilityLabel={`Call ${venue.contactPhone}`}
          className="mt-xs flex-row items-center gap-sm self-start rounded-full py-sm pl-sm pr-md"
          style={{ backgroundColor: `${theme.primary}14` }}>
          <View
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.primary }}>
            <Icon name="phone" size={14} color="#ffffff" />
          </View>
          <Typography variant="label-md" color={theme.ink} style={{ textTransform: 'none' }}>
            {venue.contactPhone}
          </Typography>
        </Pressable>
      ) : null}

      {facts.length ? (
        <Typography variant="label-sm" color={theme.primary} style={{ textTransform: 'none' }}>
          {facts.join('   ·   ')}
        </Typography>
      ) : null}
    </View>
  );
}
