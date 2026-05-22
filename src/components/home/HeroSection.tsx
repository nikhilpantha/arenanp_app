import { View } from 'react-native';

import { Button, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

export function HeroSection() {
  const theme = useTheme();
  return (
    <View className="mt-md gap-sm rounded-xl p-lg" style={{ backgroundColor: theme.primary }}>
      <Typography variant="label-sm" color="#ecfdf5">
        Stadium Pulse
      </Typography>
      <Typography variant="display-lg" color="#ffffff" className="mt-xs">
        Book your turf. Play your game.
      </Typography>
      <Typography variant="body-md" color="#d1fae5" className="mt-xs">
        Find venues, join leagues, track scores — all in one place.
      </Typography>
      <View className="mt-md">
        <Button
          variant="secondary"
          size="lg"
          iconRight="arrow-forward"
          onPress={() => console.log('[hero] book now')}>
          Book a venue
        </Button>
      </View>
    </View>
  );
}
