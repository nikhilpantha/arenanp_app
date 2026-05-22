import { View } from 'react-native';

import { Badge, Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { Venue } from '@/types';

export interface VenueCardProps {
  venue: Venue;
  onPress?: () => void;
}

export function VenueCard({ venue, onPress }: VenueCardProps) {
  const theme = useTheme();
  return (
    <Card
      onPress={onPress ?? (() => console.log('[VenueCard] tapped', venue.id))}
      className="w-60 overflow-hidden p-0">
      <View
        className="h-32 items-center justify-center"
        style={{ backgroundColor: theme.cardSunken }}>
        <Icon name="image-outline" size={32} color={theme.inkMuted} />
      </View>
      <View className="gap-sm p-md">
        <View className="flex-row items-center justify-between gap-sm">
          <Typography variant="headline-md" numberOfLines={1} className="flex-1">
            {venue.name}
          </Typography>
          <Badge variant="success">{venue.sport}</Badge>
        </View>
        <View className="flex-row items-center gap-xs">
          <Icon name="location-outline" size={14} color={theme.inkMuted} />
          <Typography variant="label-md" color={theme.inkMuted}>
            {venue.location}
          </Typography>
        </View>
        <View className="mt-xs flex-row items-end justify-between">
          <Typography variant="label-sm" color={theme.inkMuted}>
            Per hour
          </Typography>
          <Typography variant="headline-md" color={theme.primaryDark}>
            Rs {venue.pricePerHour}
          </Typography>
        </View>
      </View>
    </Card>
  );
}
