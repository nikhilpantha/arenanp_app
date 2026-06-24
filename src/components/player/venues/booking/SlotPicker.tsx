import { View } from 'react-native';

import { DateStrip, InlineLoader, NumberStepper, Typography } from '@/components/common';
import { SlotGrid } from '@/components/venue/bookings/SlotGrid';
import { useTheme } from '@/hooks/use-theme';
import type { TimeSlot } from '@/lib/booking-slots';

/** Date + duration + start-time grid for the booking flow. */
export function SlotPicker({
  date,
  onDate,
  durationSlots,
  onDuration,
  maxSlots,
  formatDuration,
  slots,
  startValue,
  onStart,
  loading,
  hasCourt,
}: {
  date: string;
  onDate: (iso: string) => void;
  durationSlots: number;
  onDuration: (n: number) => void;
  maxSlots: number;
  formatDuration: (n: number) => string;
  slots: TimeSlot[];
  startValue: string;
  onStart: (v: string) => void;
  loading: boolean;
  hasCourt: boolean;
}) {
  const theme = useTheme();

  return (
    <View className="gap-md">
      <Typography variant="label-lg">When</Typography>
      <DateStrip value={date} onChange={onDate} />

      <View className="flex-row items-center justify-between">
        <Typography variant="label-md" color={theme.inkMuted}>
          Duration
        </Typography>
        <NumberStepper
          value={durationSlots}
          onChange={onDuration}
          min={1}
          max={maxSlots}
          format={formatDuration}
        />
      </View>

      {!hasCourt ? (
        <Typography variant="body-md" color={theme.inkMuted}>
          Choose a court to see available times.
        </Typography>
      ) : loading ? (
        <InlineLoader paddingVertical={24} />
      ) : (
        <View className="gap-sm">
          <Typography variant="label-lg">Available times</Typography>
          {slots.length ? (
            <SlotGrid slots={slots} value={startValue} onSelect={onStart} />
          ) : (
            <Typography variant="body-md" color={theme.inkMuted}>
              No open times for this day — try a shorter duration or another date.
            </Typography>
          )}
        </View>
      )}
    </View>
  );
}
