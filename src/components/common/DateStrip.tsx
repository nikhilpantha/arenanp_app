import { useMemo } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Typography } from './Typography';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Day {
  iso: string;
  weekday: string;
  day: number;
}

function buildDays(count: number, startIso?: string): Day[] {
  const base = startIso ? new Date(startIso) : new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return {
      iso: d.toISOString().slice(0, 10),
      weekday: WEEKDAYS[d.getDay()],
      day: d.getDate(),
    };
  });
}

export interface DateStripProps {
  /** Selected day as "YYYY-MM-DD". */
  value: string;
  onChange: (iso: string) => void;
  /** How many days to show (default 14). */
  count?: number;
  /** First day to show as "YYYY-MM-DD" (default today) — lets callers page by month. */
  start?: string;
}

/**
 * The app's horizontal day picker — selected day filled with the accent. Defaults to a
 * today-forward strip; pass `start`/`count` to render a specific window (e.g. a month).
 */
export function DateStrip({ value, onChange, count = 14, start }: DateStripProps) {
  const theme = useTheme();
  const days = useMemo(() => buildDays(count, start), [count, start]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {days.map((d) => {
        const active = d.iso === value;
        return (
          <Pressable
            key={d.iso}
            onPress={() => onChange(d.iso)}
            className="items-center justify-center rounded-2xl px-md py-sm"
            style={[{ minWidth: 56, backgroundColor: active ? theme.primary : theme.card }, Shadow.sm]}>
            <Typography
              variant="label-sm"
              color={active ? 'rgba(255,255,255,0.85)' : theme.inkMuted}
              style={{ textTransform: 'none' }}>
              {d.weekday}
            </Typography>
            <Typography variant="headline-md" color={active ? '#ffffff' : theme.ink}>
              {d.day}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
