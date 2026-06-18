import { Pressable, View } from 'react-native';

import { Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { VenueCourtOption } from '@/lib/api/venue-bookings';

/** Radio grid of the venue's courts — two per row, half-width each. */
export function CourtPicker({
  courts,
  selectedId,
  onSelect,
}: {
  courts: VenueCourtOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  if (!courts.length) return null;

  return (
    <View className="gap-sm pt-lg">
      <Typography variant="label-md" color={theme.inkMuted}>
        Select a court
      </Typography>
      <View className="flex-row flex-wrap gap-sm">
        {courts.map((c) => {
          const active = c.id === selectedId;
          return (
            <Pressable
              key={c.id}
              onPress={() => onSelect(c.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, checked: active }}
              className="flex-row items-center gap-sm rounded-2xl border p-md"
              // Inline % — NativeWind's arbitrary `basis-[..%]` isn't honored here.
              style={{
                width: '48%',
                borderColor: active ? theme.primary : theme.border,
                backgroundColor: active ? `${theme.primary}0D` : theme.card,
              }}>
              <View
                className="h-5 w-5 items-center justify-center rounded-full border-2"
                style={{ borderColor: active ? theme.primary : theme.border }}>
                {active ? (
                  <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                ) : null}
              </View>
              <View className="flex-1 gap-[2px]">
                <Typography variant="label-lg" numberOfLines={1} color={active ? theme.primary : undefined}>
                  {c.name}
                </Typography>
                <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
                  Rs {c.pricePerHour}/slot
                </Typography>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
