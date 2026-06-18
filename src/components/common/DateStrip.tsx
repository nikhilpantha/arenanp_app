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

function buildDays(count: number): Day[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
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
  /** How many days to show, starting today (default 14). */
  count?: number;
}

/**
 * The app's horizontal day picker — today first, selected day filled with the accent.
 * Reusable across booking, calendar, memberships, etc.
 */
export function DateStrip({ value, onChange, count = 14 }: DateStripProps) {
  const theme = useTheme();
  const days = useMemo(() => buildDays(count), [count]);

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
