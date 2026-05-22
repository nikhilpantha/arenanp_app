import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { Radius, TypographyStyles } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  onPress,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  const theme = useTheme();

  const palette: Record<ButtonVariant, { bg: string; ink: string; border?: string }> = {
    primary: { bg: theme.primary, ink: '#ffffff' },
    secondary: { bg: theme.secondary, ink: theme.secondaryInk },
    ghost: { bg: 'transparent', ink: theme.ink, border: theme.border },
    danger: { bg: theme.danger, ink: '#ffffff' },
  };

  const sizes: Record<ButtonSize, { py: number; px: number; gap: number }> = {
    sm: { py: 8, px: 12, gap: 6 },
    md: { py: 12, px: 16, gap: 8 },
    lg: { py: 16, px: 20, gap: 10 },
  };

  const c = palette[variant];
  const s = sizes[size];

  const handlePress = (e: GestureResponderEvent) => {
    if (onPress) {
      onPress(e);
    } else {
      console.log('[Button]', children);
    }
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: c.bg,
          borderColor: c.border ?? 'transparent',
          borderWidth: c.border ? 1 : 0,
          paddingVertical: s.py,
          paddingHorizontal: s.px,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
      {...rest}>
      <View style={[styles.row, { gap: s.gap }]}>
        {loading ? (
          <ActivityIndicator color={c.ink} size="small" />
        ) : (
          <>
            {iconLeft && <Icon name={iconLeft} size={size === 'sm' ? 16 : 18} color={c.ink} />}
            <Typography
              variant={size === 'sm' ? 'label-md' : 'body-md'}
              color={c.ink}
              style={[styles.label, textStyle]}>
              {children}
            </Typography>
            {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} color={c.ink} />}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: TypographyStyles['label-md'].fontFamily,
  },
});
