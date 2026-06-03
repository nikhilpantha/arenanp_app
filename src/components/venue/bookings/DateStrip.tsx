import { useMemo } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Typography } from '@/components/common';
import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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

/** Horizontal day picker — today first, selected day filled green. */
export function DateStrip({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const theme = useTheme();
  const days = useMemo(() => buildDays(14), []);

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
