import { type ReactNode } from 'react';
import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Gradients } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface GradientBackgroundProps {
  children?: ReactNode;
  /** Gradient start point. Defaults to bottom-left (where the green sits). */
  start?: { x: number; y: number };
  /** Gradient end point. Defaults to top-right (the light end). */
  end?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Brand background wash — green glow at the bottom-left fading diagonally into a
 * soft light-gray toward the top-right. Fills its parent (`flex: 1`); drop it at
 * the root of a screen, or let `Screen` apply it automatically. Theme-aware via
 * `Gradients[scheme]`.
 */
export function GradientBackground({
  children,
  start = { x: 0, y: 1 },
  end = { x: 1, y: 0 },
  style,
  testID,
}: GradientBackgroundProps) {
  const scheme = useColorScheme();
  const { screen, screenLocations } = Gradients[scheme];
  // Single green brand wash for every screen and both roles.
  const colors = screen;

  return (
    <LinearGradient
      colors={colors}
      locations={screenLocations}
      start={start}
      end={end}
      style={[styles.fill, style]}
      testID={testID}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
