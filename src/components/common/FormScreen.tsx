import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useKeyboardHeight } from '@/hooks/use-keyboard';

import { AppRefreshControl } from './AppRefreshControl';
import { KeyboardAwareScrollView } from './KeyboardAwareScrollView';
import { KeyboardView } from './KeyboardView';
import { Screen } from './Screen';

export interface FormScreenProps {
  /** The body. Fixed by default; pass `scroll` to make it scrollable. */
  children: React.ReactNode;
  /** Fixed top area (e.g. ScreenHeader, StepProgress, title block). */
  header?: React.ReactNode;
  /** Pinned bottom area (primary Button + links). Stays above the keyboard and the nav bar. */
  footer?: React.ReactNode;
  /** Scroll the body instead of fixing it (default false). */
  scroll?: boolean;
  /** Pull-to-refresh handler. Only applies when `scroll`; wire it with `useRefresh`. */
  onRefresh?: () => void;
  /** Whether a pull-to-refresh is in flight (drives the spinner). Pair with `onRefresh`. */
  refreshing?: boolean;
}

/**
 * Shared scaffolding for auth + onboarding screens (user and venue). Handles the
 * fiddly parts once: top safe area, keyboard avoidance, an optional scrolling body,
 * and a sticky footer lifted clear of the keyboard and the system nav bar.
 *
 * Two keyboard strategies, picked by whether there's a pinned `footer`:
 * • With a footer — we lift it ourselves by the measured keyboard height (deterministic
 *   gap on every device). The body then shrinks above the footer, so it never overlaps
 *   the keyboard and needs no extra inset.
 * • Without a footer (an in-body CTA) — `KeyboardView` + the scroll view's keyboard inset
 *   keep the CTA reachable.
 */
export function FormScreen({
  children,
  header,
  footer,
  scroll = false,
  onRefresh,
  refreshing = false,
}: FormScreenProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  // Guarantee a minimum gap above the nav bar / home indicator even on gesture-nav
  // devices where the bottom inset is tiny.
  const bottomGap = Math.max(insets.bottom, Spacing.md);
  // When the keyboard is up, float the footer a small gap above it; otherwise clear the
  // home indicator. (No-op for the footer-less case.)
  const footerPad = keyboardHeight > 0 ? keyboardHeight + Spacing.md : bottomGap;

  const body = scroll ? (
    <KeyboardAwareScrollView
      className="flex-1"
      // With a footer, the body sits above the lifted footer and never meets the keyboard,
      // so the scroll view's own keyboard inset would only double up — turn it off.
      automaticallyAdjustKeyboardInsets={!footer}
      refreshControl={
        onRefresh ? (
          <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      contentContainerStyle={{
        paddingVertical: Spacing.md,
        paddingBottom: footer ? Spacing.md : bottomGap,
      }}>
      {children}
    </KeyboardAwareScrollView>
  ) : (
    <View className="flex-1 py-md">{children}</View>
  );

  const content = (
    <>
      {header ? <View className="pt-sm">{header}</View> : null}
      {body}
      {footer ? (
        <View className="gap-sm pt-md" style={{ paddingBottom: footerPad }}>
          {footer}
        </View>
      ) : null}
    </>
  );

  return (
    <Screen>
      {footer ? (
        // Footer is lifted manually by `footerPad`, so no KeyboardAvoidingView here.
        <View className="flex-1">{content}</View>
      ) : (
        <KeyboardView>{content}</KeyboardView>
      )}
    </Screen>
  );
}
