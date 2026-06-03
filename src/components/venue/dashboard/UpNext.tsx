import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, Icon, SectionHeader, Typography } from '@/components/common';
import { UP_NEXT } from '@/data/dashboard';
import { useTheme } from '@/hooks/use-theme';

/** The next games to start today, with the first one emphasised. */
export function UpNext() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="gap-md pt-xl">
      <SectionHeader title="Up next" actionLabel="See all" onActionPress={() => router.push('/bookings')} />
      <View className="gap-sm">
        {UP_NEXT.map((b, i) => {
          const highlight = i === 0;
          return (
            <Card
              key={b.id}
              elevation={highlight ? 'md' : 'sm'}
              style={
                highlight
                  ? { backgroundColor: `${theme.primary}0D`, borderWidth: 1.5, borderColor: theme.primary }
                  : undefined
              }
              className="flex-row items-center gap-md">
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: highlight ? `${theme.primary}1A` : theme.cardMuted }}>
                <Icon name={b.icon} size={22} color={theme.primary} />
              </View>
              <View className="flex-1 gap-[2px]">
                <Typography variant="label-lg">
                  {b.sport} · {b.court}
                </Typography>
                <Typography variant="body-md" color={theme.inkMuted}>
                  {b.customer} · {b.time}
                </Typography>
              </View>
              <View className="items-end gap-[2px]">
                <Typography variant="label-sm" color={highlight ? theme.primary : theme.inkMuted}>
                  Starts
                </Typography>
                <Typography variant="label-md" color={highlight ? theme.primary : theme.ink}>
                  {b.startsIn}
                </Typography>
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
}
