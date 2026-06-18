import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, DateStrip, Typography } from '@/components/common';
import { getSchedule, VENUE_SPORTS } from '@/data/bookings';
import { useTheme } from '@/hooks/use-theme';
import type { SportType } from '@/types';

import { useSlotStatusMeta } from './slot-status';
import { SlotRow } from './SlotRow';
import { StatusLegend } from './StatusLegend';

const todayIso = () => new Date().toISOString().slice(0, 10);

/** The day calendar (kept from the existing schedule design) — per-court hourly slots. */
export function CalendarTab({ scope }: { scope: SportType | 'all' }) {
  const theme = useTheme();
  const router = useRouter();
  const meta = useSlotStatusMeta();
  const [date, setDate] = useState(todayIso());

  // The slot grid is per-sport; fall back to the first court sport when scope is "All".
  const sport = scope !== 'all' && VENUE_SPORTS.includes(scope) ? scope : VENUE_SPORTS[0];
  const schedule = getSchedule(sport);

  const onSlotPress = (slotId: string, court: string, price: number, status: string, time: string, customer?: string) => {
    if (status === 'maintenance') return;
    router.push({
      pathname: '/booking/[id]',
      params: { id: slotId, sport, court, time, price: String(price), customer: customer ?? '', status },
    });
  };

  return (
    <View className="gap-lg">
      <DateStrip value={date} onChange={setDate} />
      <StatusLegend meta={meta} />

      {schedule.map(({ court, slots }) => (
        <View key={court.id} className="gap-sm">
          <View className="flex-row items-center justify-between">
            <Typography variant="label-lg">{court.name}</Typography>
            <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
              Rs {court.pricePerSlot}/slot
            </Typography>
          </View>
          <Card elevation="sm">
            {slots.map((slot, i) => (
              <View
                key={slot.id}
                style={i < slots.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : undefined}>
                <SlotRow
                  slot={slot}
                  price={court.pricePerSlot}
                  meta={meta[slot.status]}
                  onPress={
                    slot.status === 'maintenance'
                      ? undefined
                      : () => onSlotPress(slot.id, court.name, court.pricePerSlot, slot.status, slot.time, slot.customerName)
                  }
                />
              </View>
            ))}
          </Card>
        </View>
      ))}
    </View>
  );
}
