import { View } from 'react-native';

import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';

import { Typography } from './Typography';

export interface StepProgressProps {
  /** 1-based index of the current step. */
  current: number;
  total: number;
  label?: string;
}

/** Segmented progress bar for multi-step flows — "Step X of N" + filled segments. */
export function StepProgress({ current, total, label }: StepProgressProps) {
  const theme = useTheme();
  const { accent } = useAccent();
  const segments = Array.from({ length: total });

  return (
    <View className="gap-sm">
      <View className="flex-row items-center justify-between">
        <Typography variant="label-sm" color={accent}>
          Step {current} of {total}
        </Typography>
        {label && (
          <Typography variant="label-sm" color={theme.inkMuted}>
            {label}
          </Typography>
        )}
      </View>
      <View className="flex-row gap-xs">
        {segments.map((_, i) => (
          <View
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: i < current ? accent : theme.cardSunken }}
          />
        ))}
      </View>
    </View>
  );
}
