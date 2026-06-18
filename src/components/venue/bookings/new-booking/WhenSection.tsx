import { View } from 'react-native';

import { DateStrip, NumberStepper, Typography } from '@/components/common';
import { SlotGrid } from '@/components/venue/bookings/SlotGrid';
import { useTheme } from '@/hooks/use-theme';
import type { TimeSlot } from '@/lib/booking-slots';

/** Date, duration and the open-slot grid for the booking. */
export function WhenSection({
  date,
  onDate,
  duration,
  onDuration,
  startTime,
  onStartTime,
  openSlots,
}: {
  date: string;
  onDate: (d: string) => void;
  duration: number;
  onDuration: (d: number) => void;
  startTime: string;
  onStartTime: (t: string) => void;
  openSlots: TimeSlot[];
}) {
  const theme = useTheme();
  return (
    <>
      <View className="gap-sm pt-lg">
        <Typography variant="label-md" color={theme.inkMuted}>
          Date
        </Typography>
        <DateStrip value={date} onChange={onDate} />
      </View>

      <View className="flex-row items-center justify-between pt-lg">
        <Typography variant="label-md" color={theme.inkMuted}>
          Duration (hours)
        </Typography>
        <NumberStepper value={duration} onChange={onDuration} min={1} max={6} />
      </View>

      <View className="gap-sm pt-lg">
        <View className="flex-row items-center justify-between">
          <Typography variant="label-md" color={theme.inkMuted}>
            Available start times
          </Typography>
          {openSlots.length ? (
            <Typography variant="label-sm" color={theme.inkSubtle} style={{ textTransform: 'none' }}>
              {openSlots.length} open
            </Typography>
          ) : null}
        </View>
        <SlotGrid slots={openSlots} value={startTime} onSelect={onStartTime} />
      </View>
    </>
  );
}
