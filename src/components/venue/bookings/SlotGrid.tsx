import { Pressable, View } from 'react-native';

import { Typography } from '@/components/common';
import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TimeSlot } from '@/lib/booking-slots';

export type { TimeSlot };

/**
 * Tappable grid of start-time slots. Available slots are white pills; the selected one is
 * filled; already-booked slots are greyed + struck through and can't be tapped (so the same
 * time can never be booked twice); past slots are simply dimmed. Empty when nothing fits.
 */
export function SlotGrid({
  slots,
  value,
  onSelect,
}: {
  slots: TimeSlot[];
  value: string;
  onSelect: (value: string) => void;
}) {
  const theme = useTheme();

  if (!slots.length) {
    return (
      <Typography variant="body-md" color={theme.inkMuted}>
        No open times for this day — try a shorter duration or another date.
      </Typography>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-sm">
      {slots.map((slot) => {
        const selected = slot.available && slot.value === value;
        const bg = selected ? theme.primary : slot.available ? theme.card : theme.cardMuted;
        const fg = selected ? '#ffffff' : slot.available ? theme.ink : theme.inkSubtle;
        return (
          <Pressable
            key={slot.value}
            disabled={!slot.available}
            onPress={() => onSelect(slot.value)}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: !slot.available }}
            style={[
              {
                backgroundColor: bg,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.border,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                minWidth: 86,
                alignItems: 'center',
              },
              slot.available && !selected ? Shadow.sm : null,
            ]}>
            <Typography
              variant="label-md"
              color={fg}
              style={slot.reason === 'booked' ? { textDecorationLine: 'line-through' } : undefined}>
              {slot.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
