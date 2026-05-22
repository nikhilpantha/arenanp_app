import { View } from 'react-native';

import { Screen, Typography } from '@/components/common';
import { FeaturedVenues } from '@/components/home/FeaturedVenues';
import { HeroSection } from '@/components/home/HeroSection';
import { UpcomingMatches } from '@/components/home/UpcomingMatches';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  return (
    <Screen scroll>
      <View className="pb-xl">
        <View className="gap-xs pt-md">
          <Typography variant="label-sm" color={theme.inkMuted}>
            Welcome back
          </Typography>
          <Typography variant="headline-lg">ArenaNepalSport</Typography>
        </View>
        <HeroSection />
        <FeaturedVenues />
        <UpcomingMatches />
      </View>
    </Screen>
  );
}
