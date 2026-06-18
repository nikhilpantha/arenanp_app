import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  /** Main line. */
  message: string;
  /** Optional bold heading above the message. */
  title?: string;
  variant?: ToastVariant;
  /** Auto-dismiss after this many ms. Default 3000. */
  duration?: number;
}

interface ToastApi {
  show: (opts: ToastOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: () => void;
}

const VARIANT_ICON: Record<ToastVariant, IconName> = {
  success: 'check',
  error: 'xCircle',
  info: 'bell',
};

const ToastContext = createContext<ToastApi | null>(null);

/**
 * App-wide toast host. Wrap the app once; call `useToast()` anywhere to show a
 * themed, auto-dismissing toast that slides in from the top. A new toast replaces
 * the current one. Tap to dismiss early.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const dismiss = useCallback(() => {
    clearTimer();
    setToast(null);
  }, []);

  const show = useCallback((opts: ToastOptions) => {
    clearTimer();
    const id = (seq.current += 1);
    setToast({ ...opts, id });
    timer.current = setTimeout(
      () => setToast((t) => (t?.id === id ? null : t)),
      opts.duration ?? 3000,
    );
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message, title) => show({ message, title, variant: 'success' }),
      error: (message, title) => show({ message, title, variant: 'error' }),
      info: (message, title) => show({ message, title, variant: 'info' }),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? <ToastView key={toast.id} {...toast} onDismiss={dismiss} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({
  message,
  title,
  variant = 'info',
  onDismiss,
}: ToastOptions & { onDismiss: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tint =
    variant === 'error' ? theme.danger : variant === 'success' ? theme.success : theme.primary;

  return (
    <Animated.View
      entering={FadeInDown.duration(240)}
      exiting={FadeOutUp.duration(180)}
      pointerEvents="box-none"
      style={[styles.host, { top: insets.top + Spacing.sm }]}>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        className="flex-row items-center gap-md"
        style={[styles.card, { backgroundColor: theme.card }, Shadow.lg]}>
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${tint}1A` }}>
          <Icon name={VARIANT_ICON[variant]} size={18} color={tint} />
        </View>
        <View className="flex-1">
          {title ? <Typography variant="label-lg">{title}</Typography> : null}
          <Typography variant="body-md" color={title ? theme.inkMuted : theme.ink}>
            {message}
          </Typography>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: Spacing.page, right: Spacing.page },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius['2xl'],
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
});
