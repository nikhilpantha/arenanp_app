import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, Icon, SectionHeader, Typography } from '@/components/common';
import { TOP_TEAMS } from '@/data/dashboard';
import { useTheme } from '@/hooks/use-theme';

/** The venue's most active teams, ranked by lifetime games played. */
export function TopTeams() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="gap-md pt-xl">
      <SectionHeader title="Top teams" subtitle="By games played" />
      <Card elevation="sm">
        {TOP_TEAMS.map((t, i) => (
          <Pressable
            key={t.id}
            onPress={() => router.push({ pathname: '/team/[id]', params: { id: t.id } })}
            className="flex-row items-center gap-md py-md"
            style={i < TOP_TEAMS.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : undefined}>
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: i === 0 ? theme.primary : theme.cardMuted }}>
              <Typography variant="label-md" color={i === 0 ? '#ffffff' : theme.inkMuted}>
                {i + 1}
              </Typography>
            </View>
            <View className="flex-1 gap-[2px]">
              <Typography variant="label-lg">{t.name}</Typography>
              <Typography variant="body-md" color={theme.inkMuted}>
                {t.members.length} {t.members.length === 1 ? 'player' : 'players'}
              </Typography>
            </View>
            <View className="flex-row items-center gap-xs">
              <Icon name="activity" size={14} color={theme.primary} />
              <Typography variant="label-md" color={theme.ink}>
                {t.totalGames}
              </Typography>
            </View>
          </Pressable>
        ))}
      </Card>
    </View>
  );
}
