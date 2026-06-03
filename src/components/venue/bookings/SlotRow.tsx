import { Pressable, View } from 'react-native';

import { Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { Slot } from '@/types';

import type { SlotStatusMeta } from './slot-status';

/** One time-slot row — time, color-coded status (icon + word), customer, price. */
export function SlotRow({
  slot,
  price,
  meta,
  onPress,
}: {
  slot: Slot;
  price: number;
  meta: SlotStatusMeta;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const available = slot.status === 'available';
  const rightText = slot.status === 'maintenance' ? '—' : `Rs ${price}`;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-md py-sm"
      style={({ pressed }) => ({ opacity: pressed && onPress ? 0.92 : 1 })}>
      <Typography variant="label-md" color={theme.ink} style={{ width: 76 }}>
        {slot.time}
      </Typography>
      <View className="flex-1 flex-row items-center gap-sm">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${meta.color}1A` }}>
          <Icon name={meta.icon} size={16} color={meta.color} />
        </View>
        <View className="flex-1">
          <Typography variant="label-md" color={available ? theme.ink : meta.color}>
            {meta.label}
          </Typography>
          {slot.customerName ? (
            <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
              {slot.customerName}
            </Typography>
          ) : null}
        </View>
      </View>
      <Typography variant="label-md" color={available ? theme.inkMuted : theme.ink}>
        {rightText}
      </Typography>
    </Pressable>
  );
}
