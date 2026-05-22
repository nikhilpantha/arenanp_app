import { View } from 'react-native';

import { Badge, Card, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { Match } from '@/types';

export interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}

export function MatchCard({ match, onPress }: MatchCardProps) {
  const theme = useTheme();
  const statusVariant =
    match.status === 'live' ? 'danger' : match.status === 'finished' ? 'neutral' : 'info';

  return (
    <Card onPress={onPress ?? (() => console.log('[MatchCard] tapped', match.id))}>
      <View className="mb-md flex-row items-center justify-between">
        <Badge variant={statusVariant}>{match.status.toUpperCase()}</Badge>
        <Typography variant="label-sm" color={theme.inkMuted}>
          {match.startsAt}
        </Typography>
      </View>
      <View className="flex-row items-center justify-between gap-sm">
        <View className="flex-1">
          <Typography variant="headline-md" numberOfLines={1}>
            {match.homeTeam}
          </Typography>
        </View>
        <View className="px-md">
          {match.homeScore != null && match.awayScore != null ? (
            <Typography variant="headline-lg" color={theme.primaryDark}>
              {match.homeScore} - {match.awayScore}
            </Typography>
          ) : (
            <Typography variant="label-md" color={theme.inkMuted}>
              vs
            </Typography>
          )}
        </View>
        <View className="flex-1 items-end">
          <Typography variant="headline-md" numberOfLines={1}>
            {match.awayTeam}
          </Typography>
        </View>
      </View>
    </Card>
  );
}
