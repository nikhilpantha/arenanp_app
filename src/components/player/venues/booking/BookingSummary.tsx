import { View } from 'react-native';

import { Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const theme = useTheme();
  return (
    <View className="flex-row items-center justify-between">
      <Typography variant="body-md" color={theme.inkMuted}>
        {label}
      </Typography>
      <Typography variant="label-md" color={accent ? theme.primary : theme.ink}>
        {value}
      </Typography>
    </View>
  );
}

/** Price breakdown + the pay-at-venue / request note. */
export function BookingSummary({
  base,
  discount,
  total,
  durationLabel,
}: {
  base: number;
  discount: number;
  total: number;
  durationLabel: string;
}) {
  const theme = useTheme();
  return (
    <Card elevation="sm" className="gap-sm">
      <Row label={`Court · ${durationLabel}`} value={base > 0 ? `Rs ${base}` : '—'} />
      {discount > 0 ? <Row label="Offer discount" value={`– Rs ${discount}`} accent /> : null}
      <View className="border-t pt-sm" style={{ borderColor: theme.border }}>
        <View className="flex-row items-center justify-between">
          <Typography variant="label-lg">Total</Typography>
          <Typography variant="label-lg" color={theme.primary}>
            {base > 0 ? `Rs ${total}` : '—'}
          </Typography>
        </View>
      </View>
      <View className="mt-xs flex-row items-start gap-sm">
        <Icon name="building" size={14} color={theme.inkMuted} />
        <Typography variant="label-sm" color={theme.inkMuted} style={{ flex: 1, textTransform: 'none' }}>
          Pay at the venue — your court is reserved instantly.
        </Typography>
      </View>
    </Card>
  );
}
