import { forwardRef } from 'react';
import { Platform, ScrollView, type ScrollViewProps } from 'react-native';

export type KeyboardAwareScrollViewProps = ScrollViewProps;

/**
 * The app's standard vertical scroller for content that coexists with the keyboard.
 * Bakes in the defaults every form list wants — taps pass through to inputs/buttons
 * while the keyboard is open, no scroll indicator, and (on iOS) the content insets
 * itself by the keyboard overlap so the focused field can always scroll clear.
 *
 * All `ScrollView` props pass through and override the defaults, so callers can opt
 * out per case (e.g. `automaticallyAdjustKeyboardInsets={false}` when a footer already
 * lifts the whole list above the keyboard). For keyboard-aware footers, wrap this in
 * `KeyboardView`. Not for horizontal pickers — use a plain `ScrollView` there.
 */
export const KeyboardAwareScrollView = forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  function KeyboardAwareScrollView({ children, ...rest }, ref) {
    return (
      <ScrollView
        ref={ref}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        // iOS-only prop; on Android keyboard avoidance comes from a wrapping `KeyboardView`.
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        {...rest}>
        {children}
      </ScrollView>
    );
  },
);
