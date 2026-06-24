import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DateStrip, Icon, Screen, ScreenHeader, Typography } from '@/components/common';
import { CalendarTab } from '@/components/venue/bookings/CalendarTab';
import { type Scope, SportScope } from '@/components/venue/bookings/SportScope';
import { useTheme } from '@/hooks/use-theme';
import { useVenueCourts } from '@/lib/api/venue-bookings';
import { pad } from '@/lib/time';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayIso = () => {
  const t = new Date();
  return iso(t.getFullYear(), t.getMonth(), t.getDate());
};

/** Full booking calendar for the venue — opened from the header calendar action. */
export default function VenueCalendarScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [scope, setScope] = useState<Scope>('all');
  const [anchor, setAnchor] = useState(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() };
  });
  const [date, setDate] = useState(todayIso());

  // Sport filter reflects the venue's real courts (not a hardcoded list).
  const courts = useVenueCourts().data ?? [];
  const sports = Array.from(new Set(courts.map((c) => c.sportSlug)));

  // The current month opens at today (selected + first in the strip); other months from day 1.
  const today = new Date();
  const isCurrentMonth = anchor.y === today.getFullYear() && anchor.m === today.getMonth();
  const totalDays = new Date(anchor.y, anchor.m + 1, 0).getDate();
  const stripStart = isCurrentMonth ? todayIso() : iso(anchor.y, anchor.m, 1);
  const stripCount = isCurrentMonth ? totalDays - today.getDate() + 1 : totalDays;

  const shiftMonth = (delta: number) => {
    const d = new Date(anchor.y, anchor.m + delta, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    setAnchor({ y, m });
    const t = new Date();
    // Land the selection inside the viewed month (today when it's the current month).
    setDate(y === t.getFullYear() && m === t.getMonth() ? todayIso() : iso(y, m, 1));
  };

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Booking calendar" onBack={() => router.back()} />
      </View>
      <View className="gap-lg pt-md">
        <SportScope sports={sports} value={scope} onChange={setScope} />

        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => shiftMonth(-1)}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.card }}>
            <Icon name="chevronLeft" size={18} color={theme.ink} />
          </Pressable>
          <Typography variant="label-lg">
            {MONTHS[anchor.m]} {anchor.y}
          </Typography>
          <Pressable
            onPress={() => shiftMonth(1)}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.card }}>
            <Icon name="chevronRight" size={18} color={theme.ink} />
          </Pressable>
        </View>

        <DateStrip value={date} onChange={setDate} start={stripStart} count={stripCount} />

        <CalendarTab scope={scope} date={date} />
      </View>
    </Screen>
  );
}
