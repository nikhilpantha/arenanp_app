import {
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
  Platform,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

export interface KeyboardViewProps {
  children: React.ReactNode;
  /**
   * Whether the layout has a footer pinned to the bottom (a CTA lifted clear of the
   * keyboard). This flips the iOS strategy:
   * • with a footer → `padding` so the footer rises above the keyboard;
   * • without a footer (an in-body CTA) → no padding, so avoidance is left to the
   *   scroll view's `automaticallyAdjustKeyboardInsets` and we don't double-inset.
   */
  hasFooter?: boolean;
  /** Extra space kept between the keyboard and the avoided content (e.g. a fixed header). */
  offset?: number;
  /** Escape hatch to force a specific behavior; otherwise resolved per platform. */
  behavior?: KeyboardAvoidingViewProps['behavior'];
  style?: StyleProp<ViewStyle>;
}

/**
 * App-standard keyboard avoidance. Encapsulates the one piece of platform trivia every
 * form screen needs so callers never re-derive it:
 * • iOS — lift a pinned footer with `padding`; for an in-body CTA leave avoidance to the
 *   ScrollView (`automaticallyAdjustKeyboardInsets`) and disable padding here.
 * • Android — under edge-to-edge the window no longer auto-resizes for the IME, so
 *   `padding` is the reliable behavior in both cases (`height` is unreliable here).
 *
 * Pair with `KeyboardAwareScrollView` for the scrolling body.
 */
export function KeyboardView({ children, hasFooter = false, offset = 0, behavior, style }: KeyboardViewProps) {
  const resolved =
    behavior ?? (Platform.OS === 'ios' ? (hasFooter ? 'padding' : undefined) : 'padding');

  return (
    <KeyboardAvoidingView style={[styles.flex, style]} behavior={resolved} keyboardVerticalOffset={offset}>
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
