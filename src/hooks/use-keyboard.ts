import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * The on-screen keyboard's height (0 when hidden). Driven by the native keyboard events —
 * `will*` on iOS for an in-step animation, `did*` on Android where `will*` doesn't fire.
 *
 * Used to lift pinned footers above the keyboard ourselves: under edge-to-edge the window
 * doesn't resize for the IME on either platform, so a measured height is the reliable signal
 * (more predictable than `KeyboardAvoidingView`'s per-device padding).
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
