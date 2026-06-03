import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { Card, Icon, type IconName, Typography } from '@/components/common';
import { TODAY } from '@/data/dashboard';
import { useTheme } from '@/hooks/use-theme';

/** Hero card consolidating today's numbers into a single gradient surface. */
export function TodayHero() {
  const theme = useTheme();
  const router = useRouter();
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const toBookings = () => router.push('/bookings');

  return (
    <Card elevation="lg" style={{ padding: 0, overflow: 'hidden' }}>
      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="gap-lg p-lg">
        {/* Date + live pill */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-xs">
            <Icon name="calendarDays" size={16} color="rgba(255,255,255,0.9)" />
            <Typography variant="label-md" color="#ffffff" style={{ textTransform: 'none' }}>
              {dateLabel}
            </Typography>
          </View>
          <View
            className="flex-row items-center gap-xs rounded-full px-sm py-xs"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
            <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#ffffff' }} />
            <Typography variant="label-sm" color="#ffffff" style={{ textTransform: 'none' }}>
              Live
            </Typography>
          </View>
        </View>

        {/* Hero numbers — bookings paired with revenue earned today. */}
        <View className="flex-row items-end justify-between">
          <View className="gap-[2px]">
            <Typography variant="display-lg" color="#ffffff">
              {TODAY.bookings}
            </Typography>
            <Typography variant="label-md" color="rgba(255,255,255,0.9)">
              Games booked today
            </Typography>
          </View>
          <View className="items-end gap-[2px] pb-xs">
            <Typography variant="headline-md" color="#ffffff">
              {TODAY.revenueLabel}
            </Typography>
            <Typography variant="label-sm" color="rgba(255,255,255,0.85)" style={{ textTransform: 'none' }}>
              earned today
            </Typography>
          </View>
        </View>

        {/* Tappable chips — games still to play vs. already played today. */}
        <View className="flex-row gap-sm">
          <HeroChip
            icon="clock"
            value={String(TODAY.pending)}
            label={TODAY.pending === 1 ? 'pending game' : 'pending games'}
            onPress={toBookings}
          />
          <HeroChip icon="check" value={String(TODAY.completed)} label="completed" onPress={toBookings} />
        </View>
      </View>
    </Card>
  );
}

function HeroChip({ icon, value, label, onPress }: { icon: IconName; value: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label}`}
      onPress={onPress}
      className="flex-1 flex-row items-center gap-sm rounded-2xl px-md py-sm"
      style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
      <Icon name={icon} size={18} color="#ffffff" />
      <View className="flex-1 gap-[1px]">
        <Typography variant="label-lg" color="#ffffff" numberOfLines={1}>
          {value}
        </Typography>
        <Typography variant="label-sm" color="rgba(255,255,255,0.85)" style={{ textTransform: 'none' }} numberOfLines={1}>
          {label}
        </Typography>
      </View>
    </Pressable>
  );
}
