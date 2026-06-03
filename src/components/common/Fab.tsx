import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Shadow, TAB_BAR_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

export interface FabProps {
  onPress: () => void;
  label?: string;
  icon?: IconName;
  accessibilityLabel?: string;
}

/** Floating action button pinned bottom-right, lifted clear of the system nav bar. */
export function Fab({ onPress, label, icon = 'plus', accessibilityLabel }: FabProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? 'Add'}
      onPress={onPress}
      className="absolute right-lg flex-row items-center gap-xs rounded-full px-lg py-md"
      style={[{ bottom: insets.bottom + TAB_BAR_HEIGHT + 16, backgroundColor: theme.primary }, Shadow.lg]}>
      <Icon name={icon} size={20} color="#ffffff" />
      {label ? (
        <Typography variant="label-md" color="#ffffff" style={{ textTransform: 'none' }}>
          {label}
        </Typography>
      ) : null}
    </Pressable>
  );
}
