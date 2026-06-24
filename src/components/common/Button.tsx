import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { FontFamily, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/lib/cn';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconName;
  rightIcon?: IconName;
  /** Override the label + icon color (e.g. a red cancel). Ignored while disabled/loading. */
  labelColor?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  shadow?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  type?: 'button' | 'submit' | 'reset';
}

// Variant → background/border className map. Pressed uses NativeWind's `active:` modifier.
// Light pressed shifts darker; dark pressed shifts lighter — matches platform convention.
// Text color is driven by `labelColorMap` below (via Typography's `color` prop), because
// Typography sets `color` inline and inline style beats NativeWind className.
const variantClasses: Record<ButtonVariant, { enabled: string; disabled: string }> = {
  primary: {
    enabled: 'bg-primary-500 active:bg-primary-700 dark:bg-primary-500 dark:active:bg-primary-400',
    disabled: 'bg-primary-400 dark:bg-primary-800',
  },
  secondary: {
    enabled:
      'bg-secondary-500 active:bg-secondary-600 dark:bg-secondary-400 dark:active:bg-secondary-300',
    disabled: 'bg-secondary-400 dark:bg-secondary-800',
  },
  tertiary: {
    enabled:
      'bg-white border border-tertiary-200 active:bg-tertiary-50 active:border-tertiary-300 dark:bg-tertiary-800 dark:border-tertiary-700 dark:active:bg-tertiary-700',
    disabled:
      'bg-white border border-tertiary-100 dark:bg-tertiary-800/60 dark:border-tertiary-700/50',
  },
  ghost: {
    enabled: 'bg-transparent active:bg-tertiary-100 dark:active:bg-tertiary-800',
    disabled: 'bg-transparent',
  },
};

const sizeClasses: Record<
  ButtonSize,
  {
    container: string;
    iconOnly: string;
    iconSize: number;
    typography: 'label-sm' | 'label-md' | 'label-lg';
    gap: number;
    height: number;
  }
> = {
  sm: {
    container: 'h-9 px-3 rounded-lg',
    iconOnly: 'h-9 w-9 px-0 rounded-lg',
    iconSize: 16,
    typography: 'label-sm',
    gap: 6,
    height: 36,
  },
  md: {
    container: 'h-11 px-4 rounded-lg',
    iconOnly: 'h-11 w-11 px-0 rounded-lg',
    iconSize: 18,
    typography: 'label-md',
    gap: 8,
    height: 44,
  },
  lg: {
    container: 'h-[52px] px-5 rounded-xl',
    iconOnly: 'h-[52px] w-[52px] px-0 rounded-xl',
    iconSize: 20,
    typography: 'label-lg',
    gap: 10,
    height: 52,
  },
};

// Mirror of the label color decisions above, expressed as hex so Lucide + ActivityIndicator
// can render with the exact color the className would apply.
const iconColorMap: Record<
  ButtonVariant,
  Record<'light' | 'dark', { default: string; disabled: string }>
> = {
  primary: {
    light: { default: '#ffffff', disabled: 'rgba(255,255,255,0.6)' },
    dark: { default: '#ffffff', disabled: 'rgba(255,255,255,0.4)' },
  },
  secondary: {
    light: { default: '#ffffff', disabled: 'rgba(255,255,255,0.7)' },
    dark: { default: '#ffffff', disabled: 'rgba(255,255,255,0.6)' },
  },
  tertiary: {
    light: { default: '#334155', disabled: '#94a3b8' },
    dark: { default: '#f1f5f9', disabled: '#64748b' },
  },
  ghost: {
    light: { default: '#334155', disabled: '#94a3b8' },
    dark: { default: '#f1f5f9', disabled: '#64748b' },
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  labelColor,
  loading = false,
  disabled = false,
  fullWidth = false,
  shadow = false,
  className,
  style,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  // Green is the single brand accent for both roles. `secondary` stays a callable variant
  // for explicit semantic/amber buttons, but is never auto-applied by role.
  const effectiveVariant = variant;
  const v = variantClasses[effectiveVariant];
  const s = sizeClasses[size];
  const isInactive = disabled || loading;
  const hasLabel = Boolean(children);
  const isIconOnly = !hasLabel && Boolean(leftIcon ?? rightIcon);
  const baseColor = iconColorMap[effectiveVariant][scheme][isInactive ? 'disabled' : 'default'];
  const iconColor = labelColor && !isInactive ? labelColor : baseColor;

  const handlePress = (e: GestureResponderEvent) => {
    if (isInactive) return;
    onPress?.(e);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={handlePress}
      disabled={isInactive}
      className={cn(
        'flex-row items-center justify-center overflow-hidden',
        isIconOnly ? s.iconOnly : s.container,
        isInactive ? v.disabled : v.enabled,
        fullWidth && !isIconOnly && 'w-full self-stretch',
        className,
      )}
      style={[shadow ? (Shadow.sm as ViewStyle) : null, style]}
      {...rest}>
      {isIconOnly ? (
        <Icon name={(leftIcon ?? rightIcon) as IconName} size={s.iconSize} color={iconColor} />
      ) : loading ? (
        <View style={styles.loadingWrap}>
          {/* invisible label reserves width so the spinner doesn't collapse the button */}
          <Typography
            variant={s.typography}
            color={iconColor}
            style={styles.label}
            className="opacity-0">
            {children ?? 'Loading'}
          </Typography>
          <ActivityIndicator style={StyleSheet.absoluteFill} color={iconColor} size="small" />
        </View>
      ) : (
        <View style={[styles.row, { gap: s.gap }]}>
          {leftIcon ? <Icon name={leftIcon} size={s.iconSize} color={iconColor} /> : null}
          <Typography variant={s.typography} color={iconColor} style={styles.label}>
            {children}
          </Typography>
          {rightIcon ? <Icon name={rightIcon} size={s.iconSize} color={iconColor} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  // Button labels use ExtraBold (matching display titles) for a confident, premium CTA.
  label: {
    fontFamily: FontFamily.sansExtraBold,
    letterSpacing: 0.2,
  },
});
