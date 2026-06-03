import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Icon } from './Icon';
import { Typography } from './Typography';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onActionPress }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View className="flex-row items-end justify-between">
      <View className="flex-1 gap-xs">
        <Typography variant="headline-md">{title}</Typography>
        {subtitle && (
          <Typography variant="label-md" color={theme.inkMuted}>
            {subtitle}
          </Typography>
        )}
      </View>
      {actionLabel && (
        <Pressable
          onPress={onActionPress ?? (() => console.log('[SectionHeader] action:', title))}
          hitSlop={8}
          className="flex-row items-center gap-xs">
          <Typography variant="label-md" color={theme.primaryDark}>
            {actionLabel}
          </Typography>
          <Icon name="chevronRight" size={16} color={theme.primaryDark} />
        </Pressable>
      )}
    </View>
  );
}
