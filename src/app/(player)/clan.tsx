import { View } from 'react-native';

import { Card, Icon, Screen, Typography } from '@/components/common';
import { PlayerHeader } from '@/components/player/PlayerHeader';
import { useTheme } from '@/hooks/use-theme';

export default function ClanScreen() {
  const theme = useTheme();
  return (
    <Screen scroll>
      <View className="pt-sm">
        <PlayerHeader title="Clan" />
      </View>
      <View className="gap-md pt-md">
        <Typography variant="headline-lg">Your clan</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          Teams, playpals and the crew you game with.
        </Typography>
        <Card elevation="md" className="items-center gap-sm py-xl">
          <Icon name="users" size={28} color={theme.primary} />
          <Typography variant="label-lg">No clan yet</Typography>
          <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
            Create or join a clan to play together, run teams and enter leagues.
          </Typography>
        </Card>
      </View>
    </Screen>
  );
}
