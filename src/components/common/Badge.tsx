import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Typography } from './Typography';

export type BadgeVariant = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Badge({ children, variant = 'neutral', style, testID }: BadgeProps) {
  const theme = useTheme();

  const palette: Record<BadgeVariant, { bg: string; ink: string }> = {
    success: { bg: '#d1fae5', ink: theme.primaryDark },
    warning: { bg: '#fef3c7', ink: theme.secondaryDark },
    info: { bg: '#dbeafe', ink: '#1d4ed8' },
    danger: { bg: '#fee2e2', ink: theme.danger },
    neutral: { bg: theme.cardMuted, ink: theme.inkMuted },
  };

  const c = palette[variant];

  return (
    <View style={[styles.base, { backgroundColor: c.bg }, style]} testID={testID}>
      <Typography variant="label-sm" color={c.ink}>
        {children}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
});
