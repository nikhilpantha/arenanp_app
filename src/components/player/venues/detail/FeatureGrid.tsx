import { View } from 'react-native';

import { Icon, type IconName, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

export interface FeatureItem {
  icon: IconName;
  label: string;
  /** Optional second line, e.g. a price for an add-on service. */
  sublabel?: string;
}

/** A hotel-style 2-column grid of features: a tinted icon + label (+ optional sublabel). */
export function FeatureGrid({ items }: { items: FeatureItem[] }) {
  const theme = useTheme();
  return (
    <View className="flex-row flex-wrap">
      {items.map((it) => (
        <View key={it.label} className="w-1/2 flex-row items-center gap-sm py-sm pr-sm">
          <View
            className="h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${theme.primary}14` }}>
            <Icon name={it.icon} size={18} color={theme.primary} />
          </View>
          <View className="flex-1">
            <Typography variant="label-md" numberOfLines={1}>
              {it.label}
            </Typography>
            {it.sublabel ? (
              <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                {it.sublabel}
              </Typography>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
