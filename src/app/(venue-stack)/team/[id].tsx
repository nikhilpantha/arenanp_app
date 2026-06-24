import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Card, Icon, Screen, ScreenHeader, SportGlyph, Typography } from '@/components/common';
import { SubjectOffers } from '@/components/venue/offers/SubjectOffers';
import { getTeam } from '@/data/teams';
import { useTheme } from '@/hooks/use-theme';
import { useSports } from '@/lib/api/sports';
import { computeLoyalty } from '@/lib/loyalty';

/**
 * Team detail (mock-only): roster + history. Reached from the dashboard's "Top teams"
 * widget, which is still mock data. Venue bookings now use the unified Customer model.
 */
export default function TeamDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: sportsCatalog } = useSports();
  const team = getTeam(id ?? '');

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Team" onBack={() => router.back()} />
      </View>

      {!team ? (
        <View className="flex-1 items-center justify-center gap-sm pt-xl">
          <Icon name="users" size={28} color={theme.inkMuted} />
          <Typography variant="label-lg">Team not found</Typography>
        </View>
      ) : (
        <>
          <Card elevation="md" className="mt-md gap-md">
            <View className="flex-row items-center gap-md">
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.cardMuted }}>
                <Icon name="users" size={26} color={theme.primary} />
              </View>
              <View className="flex-1">
                <Typography variant="headline-md">{team.name}</Typography>
                <Typography variant="body-md" color={theme.inkMuted}>
                  {team.members.length} members
                </Typography>
              </View>
            </View>
            <View className="flex-row gap-md">
              <Stat value={String(team.totalGames)} label="Total games" theme={theme} />
              <Stat value={String(team.history.length)} label="Recent" theme={theme} />
            </View>
          </Card>

          <View className="pt-lg">
            <SubjectOffers subjectType="team" subjectId={team.id} games={team.totalGames} />
          </View>

          <View className="gap-sm pt-lg">
            <Typography variant="label-md" color={theme.inkMuted}>
              Players · loyalty
            </Typography>
            <Card elevation="sm">
              {team.members.map((m, i) => {
                const l = computeLoyalty(m.gamesPlayed);
                return (
                  <View
                    key={m.id}
                    className="flex-row items-center justify-between py-sm"
                    style={i < team.members.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : undefined}>
                    <Typography variant="label-md">{m.name}</Typography>
                    <Typography
                      variant="label-sm"
                      color={l.isFreeNext ? theme.primary : theme.inkMuted}
                      style={{ textTransform: 'none' }}>
                      {l.isFreeNext ? '🎉 Free game' : `${l.gamesPlayed}/${l.freeAfter}`}
                    </Typography>
                  </View>
                );
              })}
            </Card>
          </View>

          <View className="gap-sm pt-lg">
            <Typography variant="label-md" color={theme.inkMuted}>
              Game history
            </Typography>
            <Card elevation="sm">
              {team.history.map((g, i) => {
                const sportName = sportsCatalog?.find((c) => c.slug === g.sport)?.name ?? g.sport;
                return (
                  <View
                    key={g.id}
                    className="flex-row items-center gap-md py-sm"
                    style={i < team.history.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : undefined}>
                    <SportGlyph slug={g.sport} size={20} />
                    <View className="flex-1">
                      <Typography variant="label-md">
                        {sportName} · {g.court}
                      </Typography>
                      <Typography variant="body-md" color={theme.inkMuted}>
                        {g.date}
                        {g.result ? ` · ${g.result}` : ''}
                      </Typography>
                    </View>
                  </View>
                );
              })}
            </Card>
          </View>
        </>
      )}
    </Screen>
  );
}

function Stat({ value, label, theme }: { value: string; label: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <Card variant="muted" elevation="none" className="flex-1 gap-[2px]">
      <Typography variant="headline-md">{value}</Typography>
      <Typography variant="label-sm" color={theme.inkMuted}>
        {label}
      </Typography>
    </Card>
  );
}
