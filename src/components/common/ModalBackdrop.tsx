import { Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

export interface ModalBackdropProps {
  /** Tap-to-dismiss handler. Omit to make the backdrop non-interactive. */
  onPress?: () => void;
}

/**
 * The app's standard modal scrim: a dark-tinted blur over the screen behind a modal's
 * content. The frosted glass comes from the blur; the scrim guarantees the dark overlay
 * on platforms with weak blur. Shared by every modal (centered dialogs, bottom sheets,
 * pickers) so they read consistently. Render it as the first child inside a transparent
 * `Modal`, with the modal's content on top.
 */
export function ModalBackdrop({ onPress }: ModalBackdropProps) {
  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Close">
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: 'rgba(2,6,23,0.55)' },
});
