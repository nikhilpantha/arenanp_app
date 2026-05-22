import { View } from 'react-native';

import { Typography } from '@/components/common';
import { MatchCard } from '@/components/league/MatchCard';
import { useTheme } from '@/hooks/use-theme';
import type { Match } from '@/types';

const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    homeTeam: 'Lalitpur FC',
    awayTeam: 'Kathmandu XI',
    startsAt: 'Today · 6:00 PM',
    status: 'upcoming',
  },
  {
    id: 'm2',
    homeTeam: 'Patan United',
    awayTeam: 'Bhaktapur Rovers',
    startsAt: 'Live',
    status: 'live',
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: 'm3',
    homeTeam: 'Pokhara Strikers',
    awayTeam: 'Chitwan Warriors',
    startsAt: 'Tomorrow · 4:00 PM',
    status: 'upcoming',
  },
];

export function UpcomingMatches() {
  const theme = useTheme();
  return (
    <View className="mt-xl gap-md">
      <View className="flex-row items-center justify-between">
        <Typography variant="headline-md">Upcoming matches</Typography>
        <Typography
          variant="label-md"
          color={theme.primaryDark}
          onPress={() => console.log('[home] see all matches')}>
          See all
        </Typography>
      </View>
      <View className="gap-md">
        {MOCK_MATCHES.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </View>
    </View>
  );
}
