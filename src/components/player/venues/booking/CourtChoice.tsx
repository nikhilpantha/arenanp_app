import { Pressable, View } from 'react-native';

import { SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { PublicCourtData } from '@/lib/api/discovery';

type Theme = ReturnType<typeof useTheme>;

/** A single-select radio indicator. */
function RadioDot({ active, theme }: { active: boolean; theme: Theme }) {
  return (
    <View
      style={{
        height: 22,
        width: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: active ? theme.primary : theme.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {active ? (
        <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: theme.primary }} />
      ) : null}
    </View>
  );
}

/** Court selector — radio cards. Rendered only when the venue has more than one court. */
export function CourtChoice({
  courts,
  selectedId,
  onSelect,
}: {
  courts: PublicCourtData[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  if (courts.length <= 1) return null;

  return (
    <View className="gap-sm">
      <Typography variant="label-lg">Choose a court</Typography>
      {courts.map((c) => {
        const active = c.id === selectedId;
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            className="flex-row items-center gap-md rounded-2xl p-md"
            style={{
              backgroundColor: active ? `${theme.primary}14` : theme.card,
              borderWidth: 1,
              borderColor: active ? theme.primary : theme.border,
            }}>
            <SportGlyph slug={c.sport.slug} size={32} />
            <View className="flex-1 gap-[2px]">
              <Typography variant="label-md">{c.name}</Typography>
              <Typography variant="body-md" color={theme.inkMuted}>
                {c.sport.name} · Rs {c.pricePerHour}/hr
              </Typography>
            </View>
            <RadioDot active={active} theme={theme} />
          </Pressable>
        );
      })}
    </View>
  );
}
