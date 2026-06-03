import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

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
}

/**
 * Shared scaffolding for auth + onboarding screens (user and venue). Handles the
 * fiddly parts once: top safe area, keyboard avoidance, an optional scrolling body,
 * and a sticky footer lifted clear of the keyboard and the system nav bar.
 */
export function FormScreen({ children, header, footer, scroll = false }: FormScreenProps) {
  const insets = useSafeAreaInsets();
  // Guarantee a minimum gap above the nav bar / home indicator even on gesture-nav
  // devices where the bottom inset is tiny.
  const bottomGap = Math.max(insets.bottom, Spacing.md);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {header ? <View className="pt-sm">{header}</View> : null}

        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingVertical: Spacing.md,
              paddingBottom: footer ? Spacing.md : bottomGap,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View className="flex-1 py-md">{children}</View>
        )}

        {footer ? (
          <View className="gap-sm pt-md" style={{ paddingBottom: bottomGap }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
