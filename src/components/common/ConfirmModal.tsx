import { type ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { type IconName } from './Icon';
import { Modal, type ModalPlacement } from './Modal';
import { ModalActions } from './ModalActions';
import { Typography } from './Typography';

export interface ConfirmModalProps {
  visible: boolean;
  /** Dismiss without confirming (backdrop tap / Cancel). */
  onClose: () => void;
  /** Commit. The parent owns closing — keep `visible` true to stay open on error. */
  onConfirm: () => void;
  title: string;
  /** Optional one-line subtitle under the title. */
  description?: string;
  /** Optional rich body (e.g. a summary card) shown between the subtitle and the buttons. */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Spinner on the confirm button + locks the modal (no dismiss) while the action runs. */
  loading?: boolean;
  /** Inline error shown above the buttons (red). Use instead of an Alert so the modal
      stays put and the user can read the cause and retry. */
  error?: string | null;
  /** Red confirm button for irreversible actions (delete, cancel…). */
  destructive?: boolean;
  confirmIcon?: IconName;
  /** Dialog vs bottom sheet. Defaults to a bottom sheet. */
  placement?: ModalPlacement;
}

/**
 * Reusable confirm/cancel dialog built on {@link Modal}. The parent controls
 * `visible`, so the modal stays open on error (surface the failure via an Alert
 * and leave `visible` true); set `loading` while the action is in flight to show
 * a spinner and block dismissal. Drop a summary/body in as `children`.
 */
export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  error,
  destructive = false,
  confirmIcon = 'check',
  placement = 'bottom',
}: ConfirmModalProps) {
  const theme = useTheme();
  return (
    <Modal visible={visible} onClose={onClose} dismissable={!loading} placement={placement}>
      <View className="gap-md">
        <View className="gap-xs">
          <Typography variant="headline-md">{title}</Typography>
          {description ? (
            <Typography variant="body-md" color={theme.inkMuted}>
              {description}
            </Typography>
          ) : null}
        </View>

        {children}

        {error ? (
          <View
            className="rounded-2xl px-md py-sm"
            style={{ backgroundColor: `${theme.danger}14` }}>
            <Typography variant="body-md" color={theme.danger}>
              {error}
            </Typography>
          </View>
        ) : null}

        <ModalActions
          confirmLabel={confirmLabel}
          onConfirm={onConfirm}
          onCancel={onClose}
          cancelLabel={cancelLabel}
          loading={loading}
          destructive={destructive}
          confirmIcon={confirmIcon}
        />
      </View>
    </Modal>
  );
}
