import { Pressable, ScrollView } from 'react-native';

import { SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { useSports } from '@/lib/api/sports';
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
  const { data: catalog } = useSports();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      <Pressable
        key="all"
        onPress={() => onChange('all')}
        className="flex-row items-center gap-xs rounded-full px-md py-sm"
        style={{
          backgroundColor: value === 'all' ? theme.primary : theme.card,
          borderWidth: 1,
          borderColor: value === 'all' ? theme.primary : theme.border,
        }}>
        <Typography
          variant="label-md"
          color={value === 'all' ? '#ffffff' : theme.ink}
          style={{ textTransform: 'none' }}>
          All
        </Typography>
      </Pressable>

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
