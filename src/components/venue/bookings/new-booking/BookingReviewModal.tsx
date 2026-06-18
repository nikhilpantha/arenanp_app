import { View } from 'react-native';

import { ConfirmModal, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

/** Final review (court/sport/customer/date/time/payment + total) before committing. */
export function BookingReviewModal({
  visible,
  onClose,
  onConfirm,
  loading,
  error,
  rows,
  totalLabel,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  error?: string | null;
  rows: { label: string; value: string }[];
  totalLabel: string;
}) {
  const theme = useTheme();
  return (
    <ConfirmModal
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirm booking"
      confirmLabel="Confirm"
      placement="center"
      loading={loading}
      error={error}>
      <View className="gap-sm rounded-2xl p-md" style={{ backgroundColor: theme.cardMuted }}>
        {rows.map((r) => (
          <View key={r.label} className="flex-row items-start justify-between gap-md">
            <Typography variant="body-md" color={theme.inkMuted}>
              {r.label}
            </Typography>
            <Typography variant="label-md" style={{ flex: 1, textAlign: 'right' }}>
              {r.value}
            </Typography>
          </View>
        ))}
        <View
          className="flex-row items-center justify-between gap-md border-t pt-sm"
          style={{ borderColor: theme.border }}>
          <Typography variant="label-lg">Total</Typography>
          <Typography variant="label-lg" color={theme.primary}>
            {totalLabel}
          </Typography>
        </View>
      </View>
    </ConfirmModal>
  );
}
