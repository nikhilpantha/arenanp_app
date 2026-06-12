import { Pressable, ScrollView } from 'react-native';

import { SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { useSports } from '@/lib/api/sports';
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
  const { data: catalog } = useSports();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {sports.map((s) => {
        const active = s === value;
        const name = catalog?.find((c) => c.slug === s)?.name ?? s;
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
            <SportGlyph slug={s} size={18} />
            <Typography
              variant="label-md"
              color={active ? '#ffffff' : theme.ink}
              style={{ textTransform: 'none' }}>
              {name}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
