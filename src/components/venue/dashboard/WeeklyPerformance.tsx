import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card, SectionHeader, Typography } from '@/components/common';
import { Shadow } from '@/constants/theme';
import { WEEK } from '@/data/dashboard';
import { useTheme } from '@/hooks/use-theme';

type Metric = 'matches' | 'revenue';

/** Switchable weekly bar graph — matches vs. revenue, today's bar highlighted. */
export function WeeklyPerformance() {
  const theme = useTheme();
  const [metric, setMetric] = useState<Metric>('matches');

  const values = WEEK.map((d) => d[metric]);
  const max = Math.max(...values, 1);
  const total = values.reduce((a, b) => a + b, 0);
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon-indexed
  const fmt = (v: number) => (metric === 'revenue' ? `${Math.round(v / 1000)}k` : String(v));
  const totalLabel = metric === 'revenue' ? `Rs ${Math.round(total / 1000)}k` : `${total} matches`;

  return (
    <View className="gap-md pt-xl">
      <SectionHeader title="Weekly performance" />
      <Card elevation="sm" className="gap-lg">
        <View className="flex-row items-center justify-between">
          <View className="gap-[2px]">
            <Typography variant="headline-md">{totalLabel}</Typography>
            <Typography variant="label-sm" color={theme.inkMuted}>
              This week
            </Typography>
          </View>
          <View className="flex-row rounded-full p-[3px]" style={{ backgroundColor: theme.cardMuted }}>
            {(['matches', 'revenue'] as const).map((m) => {
              const active = metric === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMetric(m)}
                  className="rounded-full px-md py-xs"
                  style={active ? [{ backgroundColor: theme.card }, Shadow.sm] : undefined}>
                  <Typography
                    variant="label-sm"
                    color={active ? theme.primary : theme.inkMuted}
                    style={{ textTransform: 'none' }}>
                    {m === 'matches' ? 'Matches' : 'Revenue'}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-row items-end gap-sm">
          {WEEK.map((d, i) => {
            const h = Math.max(8, (d[metric] / max) * 104);
            const isToday = i === todayIdx;
            return (
              <View key={d.day} className="flex-1 items-center gap-xs">
                <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                  {fmt(d[metric])}
                </Typography>
                <View
                  className="w-full rounded-md"
                  style={{ height: h, backgroundColor: isToday ? theme.primary : `${theme.primary}33` }}
                />
                <Typography
                  variant="label-sm"
                  color={isToday ? theme.primary : theme.inkMuted}
                  style={{ textTransform: 'none' }}>
                  {d.day}
                </Typography>
              </View>
            );
          })}
        </View>
      </Card>
    </View>
  );
}
