import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Shadow } from '@/constants/theme';
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
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-12 w-12 items-center justify-center rounded-full bg-white border border-tertiary-200"
            style={({ pressed }) => [
              {
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                ...Shadow.sm,
              },
              pressed && { opacity: 0.6 },
            ]}>
            <Icon name={backIcon} size={22} color={theme.ink} />
          </Pressable>
        )}
      </View>

      <View className="flex-1 items-center px-sm">
        {title ? (
          <Typography variant="label-lg" numberOfLines={1} style={{ textAlign: 'center' }}>
            {title}
          </Typography>
        ) : null}
      </View>

      <View style={{ minWidth: 44 }} className="items-end">
        {right}
      </View>
    </View>
  );
}
