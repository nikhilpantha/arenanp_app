import { View } from 'react-native';

import { Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { SlotStatus } from '@/types';

import type { SlotStatusMeta } from './slot-status';

/** Color → meaning key for the slot grid. */
export function StatusLegend({ meta }: { meta: Record<SlotStatus, SlotStatusMeta> }) {
  const theme = useTheme();
  return (
    <View className="flex-row flex-wrap gap-md">
      {Object.values(meta).map((m) => (
        <View key={m.label} className="flex-row items-center gap-xs">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
          <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
            {m.label}
          </Typography>
        </View>
      ))}
    </View>
  );
}
