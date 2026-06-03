import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, Icon, SectionHeader, Typography } from '@/components/common';
import { RECURRING_SLOTS } from '@/data/dashboard';
import { useTheme } from '@/hooks/use-theme';

/** Subscription/membership slots that repeat — kept reserved for their holders. */
export function RecurringSlots() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="gap-md pt-xl">
      <SectionHeader
        title="Recurring slots"
        subtitle="Reserved for subscriptions"
        actionLabel="Manage"
        onActionPress={() => router.push('/bookings')}
      />
      <View className="gap-sm">
        {RECURRING_SLOTS.map((r) => (
          <Card key={r.id} elevation="sm" className="flex-row items-center gap-md">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${theme.secondaryDark}1A` }}>
              <Icon name="repeat" size={20} color={theme.secondaryDark} />
            </View>
            <View className="flex-1 gap-[2px]">
              <Typography variant="label-lg">{r.holder}</Typography>
              <Typography variant="body-md" color={theme.inkMuted}>
                {r.sport} · {r.court} · {r.time}
              </Typography>
            </View>
            <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
              {r.cadence}
            </Typography>
          </Card>
        ))}
      </View>
    </View>
  );
}
