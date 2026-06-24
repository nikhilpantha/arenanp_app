import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, Icon, InlineLoader, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { useVenueCourts, useVenueDayBookings } from '@/lib/api/venue-bookings';
import type { SportType } from '@/types';

import { buildCourtSchedules } from './calendar-grid';
import { useSlotStatusMeta } from './slot-status';
import { SlotRow } from './SlotRow';
import { StatusLegend } from './StatusLegend';

/**
 * Per-court day calendar on live data: the venue's real courts (filtered by sport scope)
 * with each day's bookings overlaid. Empty slots are tappable and open the New booking
 * screen pre-filled with that court, day and time; booked slots show who holds them.
 */
export function CalendarTab({ scope, date }: { scope: SportType | 'all'; date: string }) {
  const theme = useTheme();
  const router = useRouter();
  const meta = useSlotStatusMeta();

  const courtsQ = useVenueCourts();
  const bookingsQ = useVenueDayBookings(date);

  const courts = (courtsQ.data ?? []).filter((c) => scope === 'all' || c.sportSlug === scope);
  const schedules = buildCourtSchedules(courts, bookingsQ.data ?? []);

  if (courtsQ.isLoading) return <InlineLoader paddingVertical={48} />;

  if (courts.length === 0) {
    return (
      <Card elevation="sm">
        <View className="items-center gap-sm py-xl">
          <Icon name="calendarDays" size={26} color={theme.inkMuted} />
          <Typography variant="body-md" color={theme.inkMuted}>
            {scope === 'all' ? 'No courts set up yet.' : 'No courts for this sport.'}
          </Typography>
        </View>
      </Card>
    );
  }

  return (
    <View className="gap-lg">
      <StatusLegend meta={meta} />
      {bookingsQ.isLoading ? <InlineLoader paddingVertical={16} /> : null}

      {schedules.map(({ court, entries }) => (
        <View key={court.id} className="gap-sm">
          <View className="flex-row items-center justify-between">
            <Typography variant="label-lg">{court.name}</Typography>
            <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
              {court.sportLabel} · Rs {court.pricePerHour}/hr
            </Typography>
          </View>
          <Card elevation="sm">
            {entries.map((entry, i) => (
              <View
                key={entry.slot.id}
                style={
                  i < entries.length - 1 ? { borderBottomWidth: 1, borderColor: theme.border } : undefined
                }>
                <SlotRow
                  slot={entry.slot}
                  price={court.pricePerHour}
                  meta={meta[entry.slot.status]}
                  // Only empty slots are actionable → start a booking pre-filled with this slot.
                  onPress={
                    entry.booking
                      ? undefined
                      : () =>
                          router.push({
                            pathname: '/new-booking',
                            params: {
                              courtId: court.id,
                              court: court.name,
                              sport: court.sportSlug,
                              price: String(court.pricePerHour),
                              time: entry.slot.time,
                              date,
                            },
                          })
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
