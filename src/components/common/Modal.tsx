import { type ReactNode } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ModalBackdrop } from './ModalBackdrop';

export type ModalPlacement = 'center' | 'bottom';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Tap-outside / hardware-back dismiss. Default true. */
  dismissable?: boolean;
  /**
   * `center` — a compact dialog floating in the middle (good for short confirms).
   * `bottom` — a sheet that rises from the bottom and uses up to ~90% of the height,
   * hugging its content and scrolling when taller. Roomier for richer forms.
   */
  placement?: ModalPlacement;
}

/**
 * Reusable modal over a blurred, dark-tinted backdrop. Tapping the backdrop (or
 * Android back) closes it when `dismissable`. Choose `placement` for a centered
 * dialog or a bottom sheet. The card swallows its own taps so only the backdrop
 * dismisses.
 */
export function Modal({
  visible,
  onClose,
  children,
  dismissable = true,
  placement = 'center',
}: ModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dismiss = dismissable ? onClose : undefined;
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <ModalBackdrop onPress={dismiss} />

      {placement === 'bottom' ? (
        // `box-none` lets taps outside the sheet fall through to the backdrop.
        <View pointerEvents="box-none" style={styles.bottomHost}>
          <Animated.View entering={SlideInDown.duration(260)}>
            <Pressable
              onPress={stop}
              style={[
                styles.sheet,
                { backgroundColor: theme.bg, paddingBottom: insets.bottom + Spacing.lg },
              ]}>
              <View style={[styles.grabber, { backgroundColor: theme.border }]} />
              {children}
            </Pressable>
          </Animated.View>
        </View>
      ) : (
        <View pointerEvents="box-none" style={styles.center}>
          <Pressable onPress={stop} style={[styles.card, { backgroundColor: theme.bg }]}>
            {children}
          </Pressable>
        </View>
      )}
    </RNModal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  card: { width: '100%', maxWidth: 420, borderRadius: Radius['3xl'], padding: Spacing.lg },
  bottomHost: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    // Cap at 80% of the screen so a strip of the page stays visible behind the sheet;
    // taller content scrolls inside rather than growing the sheet toward the top.
    maxHeight: '80%',
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
});
