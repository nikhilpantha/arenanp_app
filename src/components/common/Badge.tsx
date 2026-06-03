import { type StyleProp, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/cn';

import { Typography } from './Typography';

export type BadgeVariant = 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'verified';

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Badge({ children, variant = 'neutral', className, style, testID }: BadgeProps) {
  const theme = useTheme();

  const palette: Record<BadgeVariant, { bg: string; ink: string }> = {
    success: { bg: '#d1fae5', ink: theme.primaryDark },
    warning: { bg: '#fef3c7', ink: theme.secondaryDark },
    info: { bg: '#dbeafe', ink: '#1d4ed8' },
    danger: { bg: '#fee2e2', ink: theme.danger },
    neutral: { bg: theme.cardMuted, ink: theme.inkMuted },
    // Semantic amber for the venue Verified badge (role-independent).
    verified: { bg: '#fef3c7', ink: theme.secondaryDark },
  };

  const c = palette[variant];

  return (
    <View
      className={cn('self-start rounded-full px-1.5 py-0.5', className)}
      style={[{ backgroundColor: c.bg }, style]}
      testID={testID}>
      <Typography variant="label-sm" color={c.ink}>
        {children}
      </Typography>
    </View>
  );
}
