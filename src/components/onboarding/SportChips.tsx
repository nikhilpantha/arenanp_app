import { Pressable, View } from 'react-native';

import { Typography } from '@/components/common';
import { SPORTS_CATALOG } from '@/data/sports';
import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';
import type { SportType } from '@/types';

export interface SportChipsProps {
  value: SportType[];
  onChange: (next: SportType[]) => void;
}

/** Controlled multi-select grid of sports (role-accented), driven by SPORTS_CATALOG. */
export function SportChips({ value, onChange }: SportChipsProps) {
  const theme = useTheme();
  const { accent } = useAccent();

  const toggle = (sport: SportType) => {
    onChange(value.includes(sport) ? value.filter((s) => s !== sport) : [...value, sport]);
  };

  return (
    <View className="flex-row flex-wrap gap-sm">
      {SPORTS_CATALOG.map((item) => {
        const active = value.includes(item.sport);
        return (
          <Pressable
            key={item.sport}
            onPress={() => toggle(item.sport)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className="flex-row items-center gap-sm rounded-full border px-md py-sm"
            style={{
              backgroundColor: active ? `${accent}14` : theme.card,
              borderColor: active ? accent : theme.border,
            }}>
            <Typography variant="body-lg" style={{ fontSize: 20, lineHeight: 24 }}>
              {item.emoji}
            </Typography>
            <Typography variant="label-lg" color={active ? accent : theme.ink}>
              {item.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
