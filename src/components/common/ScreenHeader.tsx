import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

export interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  /** Defaults to a back arrow; pass e.g. "x" to show a close icon instead. */
  backIcon?: IconName;
  /** Optional element rendered on the right (e.g. a menu button). */
  right?: ReactNode;
}

/** Top bar with a circular back button, optional centered title, and a right slot. */
export function ScreenHeader({ title, onBack, backIcon = 'arrowLeft', right }: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View className="flex-row items-center" style={{ minHeight: 44 }}>
      <View style={{ width: 44 }}>
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-11 w-11 -ml-2 items-center justify-center">
            <Icon name={backIcon} size={26} color={theme.ink} />
          </Pressable>
        )}
      </View>

      <View className="flex-1 items-center">
        {title ? <Typography variant="label-lg">{title}</Typography> : null}
      </View>

      <View style={{ width: 44 }} className="items-end">
        {right}
      </View>
    </View>
  );
}
