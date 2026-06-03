import { Pressable, View } from 'react-native';

import { useAccent } from '@/hooks/use-accent';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './Icon';
import { Typography } from './Typography';

export interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/** Compact − value + control for small integer counts (e.g. number of courts). */
export function NumberStepper({ value, onChange, min = 1, max = 99 }: NumberStepperProps) {
  const theme = useTheme();
  const { accent } = useAccent();

  const set = (next: number) => onChange(Math.max(min, Math.min(max, next)));

  return (
    <View className="flex-row items-center gap-md">
      <Pressable
        onPress={() => set(value - 1)}
        disabled={value <= min}
        hitSlop={6}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.cardMuted, opacity: value <= min ? 0.4 : 1 }}>
        <Icon name="minus" size={16} color={theme.ink} />
      </Pressable>
      <Typography variant="label-lg" style={{ minWidth: 20, textAlign: 'center' }}>
        {value}
      </Typography>
      <Pressable
        onPress={() => set(value + 1)}
        disabled={value >= max}
        hitSlop={6}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: accent, opacity: value >= max ? 0.4 : 1 }}>
        <Icon name="plus" size={16} color="#ffffff" />
      </Pressable>
    </View>
  );
}
