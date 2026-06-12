import { Pressable, View } from 'react-native';

import { SportGlyph, Typography } from '@/components/common';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';
import { useSports } from '@/lib/api/sports';
import type { SportType } from '@/types';

export interface SportChipsProps {
  value: SportType[];
  onChange: (next: SportType[]) => void;
}

/** Controlled multi-select grid of sports (role-accented), driven by the live catalogue. */
export function SportChips({ value, onChange }: SportChipsProps) {
  const theme = useTheme();
  const { accent } = useAccent();
  const { data: sports } = useSports();

  const toggle = (sport: SportType) => {
    onChange(value.includes(sport) ? value.filter((s) => s !== sport) : [...value, sport]);
  };

  return (
    <View className="flex-row flex-wrap gap-sm">
      {(sports ?? []).map((item) => {
        const active = value.includes(item.slug);
        return (
          <Pressable
            key={item.slug}
            onPress={() => toggle(item.slug)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className="flex-row items-center gap-sm rounded-full border px-md py-sm"
            style={{
              backgroundColor: active ? `${accent}14` : theme.card,
              borderColor: active ? accent : theme.border,
            }}>
            <SportGlyph slug={item.slug} size={20} />
            <Typography variant="label-lg" color={active ? accent : theme.ink}>
              {item.name}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
