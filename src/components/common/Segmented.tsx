import { Pressable, View } from 'react-native';

import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Typography } from './Typography';

export interface SegmentedOption {
  value: string;
  label: string;
  /** Optional count shown as a small badge (e.g. pending requests). */
  badge?: number;
}

export interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}

/** Pill segmented control — green selected state, optional per-segment badge. */
export function Segmented({ options, value, onChange }: SegmentedProps) {
  const theme = useTheme();
  return (
    <View className="flex-row rounded-full p-[3px]" style={{ backgroundColor: theme.cardMuted }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            className="flex-1 flex-row items-center justify-center gap-xs rounded-full py-sm"
            style={active ? [{ backgroundColor: theme.card }, Shadow.sm] : undefined}>
            <Typography
              variant="label-sm"
              color={active ? theme.primary : theme.inkMuted}
              style={{ textTransform: 'none' }}>
              {o.label}
            </Typography>
            {o.badge ? (
              <View
                className="h-4 min-w-4 items-center justify-center rounded-full px-1"
                style={{ backgroundColor: theme.danger }}>
                <Typography variant="label-sm" color="#ffffff" style={{ textTransform: 'none', fontSize: 10 }}>
                  {o.badge}
                </Typography>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
