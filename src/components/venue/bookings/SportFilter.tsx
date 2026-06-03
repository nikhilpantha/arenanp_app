import { Pressable, ScrollView } from 'react-native';

import { Typography } from '@/components/common';
import { SPORTS_CATALOG } from '@/data/sports';
import { useTheme } from '@/hooks/use-theme';
import type { SportType } from '@/types';

/** Pill row of the sports the venue offers (emoji + label), single-select. */
export function SportFilter({
  sports,
  value,
  onChange,
}: {
  sports: SportType[];
  value: SportType;
  onChange: (sport: SportType) => void;
}) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {sports.map((s) => {
        const entry = SPORTS_CATALOG.find((e) => e.sport === s);
        const active = s === value;
        return (
          <Pressable
            key={s}
            onPress={() => onChange(s)}
            className="flex-row items-center gap-xs rounded-full px-md py-sm"
            style={{
              backgroundColor: active ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor: active ? theme.primary : theme.border,
            }}>
            <Typography variant="label-md" style={{ textTransform: 'none' }}>
              {entry?.emoji ?? '🏟️'}
            </Typography>
            <Typography
              variant="label-md"
              color={active ? '#ffffff' : theme.ink}
              style={{ textTransform: 'none' }}>
              {entry?.label ?? s}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
