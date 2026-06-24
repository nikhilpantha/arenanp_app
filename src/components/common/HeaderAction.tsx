import { Pressable, View } from 'react-native';

import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './Icon';

export interface HeaderActionProps {
  icon: IconName;
  /** Accessibility label (also the action's intent, e.g. "Notifications"). */
  label: string;
  onPress: () => void;
  /** Show an unread/attention dot in the corner. */
  showDot?: boolean;
}

/**
 * A circular 44×44 header button — the calendar / notification actions shared by the
 * venue and player headers. Card background + soft shadow, optional attention dot.
 */
export function HeaderAction({ icon, label, onPress, showDot }: HeaderActionProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full"
      style={[{ backgroundColor: theme.card }, Shadow.sm]}>
      <Icon name={icon} size={22} color={theme.ink} />
      {showDot ? (
        <View
          className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: theme.danger, borderWidth: 1.5, borderColor: theme.card }}
        />
      ) : null}
    </Pressable>
  );
}
