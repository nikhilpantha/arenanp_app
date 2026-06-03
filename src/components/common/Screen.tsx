import { ScrollView, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing, TAB_BAR_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { GradientBackground } from './GradientBackground';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Soft mint→white background wash from the design (default on). Set false for a flat bg. */
  gradient?: boolean;
  /** Pads the bottom clear of the native tab bar. Set on screens that live inside the tabs. */
  tabBarSafe?: boolean;
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  gradient = true,
  tabBarSafe = false,
  edges = ['top', 'left', 'right'],
  style,
  contentContainerStyle,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // When gradient is on, the SafeAreaView is transparent and the gradient fills behind it.
  const containerStyle = [
    styles.safe,
    gradient ? styles.transparent : { backgroundColor: theme.bg },
    style,
  ];
  // Tab screens draw under the native tab bar, so reserve space for it (bar + safe inset).
  const tabBarPad = tabBarSafe ? { paddingBottom: insets.bottom + TAB_BAR_HEIGHT } : null;
  const contentStyle = [padded && styles.padded, tabBarPad, contentContainerStyle];

  const body = scroll ? (
    <SafeAreaView style={containerStyle} edges={edges} testID={testID}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={containerStyle} edges={edges} testID={testID}>
      <View style={[styles.flex, contentStyle]}>{children}</View>
    </SafeAreaView>
  );

  if (!gradient) return body;

  return <GradientBackground>{body}</GradientBackground>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  transparent: { backgroundColor: 'transparent' },
  padded: { paddingHorizontal: Spacing.page },
});
