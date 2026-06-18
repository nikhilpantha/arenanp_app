import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Button } from './Button';
import { type IconName } from './Icon';

export interface ModalActionsProps {
  /** Primary action label, e.g. "Complete · Rs 555". */
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  cancelLabel?: string;
  /** Spinner on the primary button + disables both while the action runs. */
  loading?: boolean;
  /** Disable the primary action (e.g. invalid form) without showing a spinner. */
  confirmDisabled?: boolean;
  /** Red primary button for irreversible actions (cancel, delete…). */
  destructive?: boolean;
  confirmIcon?: IconName;
}

/**
 * Shared footer for modals and bottom sheets: a large full-width primary button
 * stacked above a white (outlined) cancel. Vertical (not side-by-side) so each is
 * an easy, unambiguous tap target. Use this for every dialog/sheet action row.
 */
export function ModalActions({
  confirmLabel,
  onConfirm,
  onCancel,
  cancelLabel = 'Cancel',
  loading = false,
  confirmDisabled = false,
  destructive = false,
  confirmIcon = 'check',
}: ModalActionsProps) {
  const theme = useTheme();
  return (
    <View className="gap-sm">
      <Button
        size="lg"
        fullWidth
        className="rounded-full"
        rightIcon={confirmIcon}
        loading={loading}
        disabled={confirmDisabled}
        style={destructive ? { backgroundColor: theme.danger } : undefined}
        onPress={onConfirm}>
        {confirmLabel}
      </Button>
      <Button
        variant="tertiary"
        size="lg"
        fullWidth
        className="rounded-full"
        disabled={loading}
        onPress={onCancel}>
        {cancelLabel}
      </Button>
    </View>
  );
}
