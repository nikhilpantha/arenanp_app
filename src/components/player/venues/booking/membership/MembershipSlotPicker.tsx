import { View } from 'react-native';

import { DateStrip, InlineLoader, Typography } from '@/components/common';
import { CourtChoice } from '@/components/player/venues/booking/CourtChoice';
import { SlotGrid } from '@/components/venue/bookings/SlotGrid';
import { useTheme } from '@/hooks/use-theme';
import type { PublicCourtData } from '@/lib/api/discovery';

interface MembershipSlot {
  start: string;
  label: string;
  available: boolean;
}

/** Court (filtered to the plan's sports) + start date + the plan's allowed time slots. */
export function MembershipSlotPicker({
  courts,
  courtId,
  onCourt,
  date,
  onDate,
  slots,
  slotStart,
  onSlot,
  loading,
  noneFree,
}: {
  courts: PublicCourtData[];
  courtId?: string;
  onCourt: (id: string) => void;
  date: string;
  onDate: (iso: string) => void;
  slots: MembershipSlot[];
  slotStart: string;
  onSlot: (start: string) => void;
  loading?: boolean;
  noneFree?: boolean;
}) {
  const theme = useTheme();

  return (
    <View className="gap-md">
      <CourtChoice courts={courts} selectedId={courtId} onSelect={onCourt} />

      <View className="gap-sm">
        <Typography variant="label-lg">Start date</Typography>
        <DateStrip value={date} onChange={onDate} />
      </View>

      <View className="gap-sm">
        <Typography variant="label-lg">Daily time</Typography>
        {loading ? (
          <InlineLoader paddingVertical={16} />
        ) : (
          <>
            <SlotGrid
              slots={slots.map((s) => ({
                value: s.start,
                label: s.label,
                available: s.available,
                reason: s.available ? undefined : 'booked',
              }))}
              value={slotStart}
              onSelect={onSlot}
            />
            {noneFree ? (
              <Typography variant="body-md" color={theme.inkMuted}>
                Every time on this court is taken for this start date — try another court or a later
                start date.
              </Typography>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}
