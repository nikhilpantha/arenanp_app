import { Pressable, ScrollView } from 'react-native';

import { Typography } from '@/components/common';
import { SPORTS_CATALOG } from '@/data/sports';
import { useTheme } from '@/hooks/use-theme';
import type { SportType } from '@/types';

export type Scope = SportType | 'all';

/** Pill row of sports (with a leading "All") to filter the booking lists. */
export function SportScope({
  sports,
  value,
  onChange,
}: {
  sports: SportType[];
  value: Scope;
  onChange: (scope: Scope) => void;
}) {
  const theme = useTheme();
  const options: { key: Scope; emoji: string; label: string }[] = [
    { key: 'all', emoji: '🏟️', label: 'All' },
    ...sports.map((s) => {
      const entry = SPORTS_CATALOG.find((e) => e.sport === s);
      return { key: s, emoji: entry?.emoji ?? '🏟️', label: entry?.label ?? s };
    }),
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            className="flex-row items-center gap-xs rounded-full px-md py-sm"
            style={{
              backgroundColor: active ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor: active ? theme.primary : theme.border,
            }}>
            <Typography variant="label-md" style={{ textTransform: 'none' }}>
              {o.emoji}
            </Typography>
            <Typography variant="label-md" color={active ? '#ffffff' : theme.ink} style={{ textTransform: 'none' }}>
              {o.label}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
