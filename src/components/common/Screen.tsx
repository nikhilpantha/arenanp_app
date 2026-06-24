import { Platform, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing, TAB_BAR_HEIGHT } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppRefreshControl } from './AppRefreshControl';
import { GradientBackground } from './GradientBackground';
import { KeyboardAwareScrollView } from './KeyboardAwareScrollView';
import { KeyboardView } from './KeyboardView';

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
  /** Pull-to-refresh handler. Only applies when `scroll`; wire it with `useRefresh`. */
  onRefresh?: () => void;
  /** Whether a pull-to-refresh is in flight (drives the spinner). Pair with `onRefresh`. */
  refreshing?: boolean;
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
  onRefresh,
  refreshing = false,
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
      {/* Keyboard-aware so any inputs inside a scrolling screen stay clear of the keyboard
          (iOS via content insets, Android via the KeyboardView's padding). */}
      <KeyboardView>
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={contentStyle}
          refreshControl={
            onRefresh ? (
              <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }>
          {children}
        </KeyboardAwareScrollView>
      </KeyboardView>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={containerStyle} edges={edges} testID={testID}>
      <View style={[styles.flex, contentStyle]}>{children}</View>
    </SafeAreaView>
  );

  if (!gradient) return body;

  return (
    <GradientBackground>
      {body}
      {/* Under edge-to-edge, Android draws content behind the transparent system nav bar.
          On gradient screens that lets the wash bleed under the nav buttons; fill that
          inset with a solid surface color so the nav bar reads as a defined bar. We use
          `card` to match the white native tab bar (`backgroundColor={Colors.light.card}`),
          so the bottom stays one continuous color. iOS has no such bar — unchanged there. */}
      {Platform.OS === 'android' && insets.bottom > 0 ? (
        <View
          pointerEvents="none"
          style={[styles.navBar, { height: insets.bottom, backgroundColor: theme.card }]}
        />
      ) : null}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  transparent: { backgroundColor: 'transparent' },
  padded: { paddingHorizontal: Spacing.page },
  navBar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
