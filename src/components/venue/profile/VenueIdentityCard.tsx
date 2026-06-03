import { View } from 'react-native';

import { Badge, Card, Icon, Typography } from '@/components/common';
import { isVerified } from '@/components/venue/onboarding/form';
import { useTheme } from '@/hooks/use-theme';
import { useVenueStore } from '@/stores';

/** Venue name, location and verification badge at the top of the profile. */
export function VenueIdentityCard() {
  const theme = useTheme();
  const venue = useVenueStore((s) => s.venue);
  const verified = isVerified(venue.verification);

  return (
    <Card elevation="md" className="flex-row items-center gap-md">
      <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: theme.cardMuted }}>
        <Icon name="building" size={26} color={theme.primary} />
      </View>
      <View className="flex-1 gap-[2px]">
        <Typography variant="headline-md" numberOfLines={1}>
          {venue.venueName}
        </Typography>
        <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
          {venue.address}
        </Typography>
      </View>
      <Badge variant={verified ? 'verified' : 'neutral'}>{verified ? 'Verified' : 'Unverified'}</Badge>
    </Card>
  );
}
