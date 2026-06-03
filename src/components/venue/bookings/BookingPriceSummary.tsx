import { View } from 'react-native';

import { Card, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

export interface BookingPriceSummaryProps {
  duration: number;
  base: number;
  discountAmt: number;
  discountReason: string;
  isFree: boolean;
  totalLabel: string;
}

/** Slot price → discount → loyalty → total breakdown for the new-booking flow. */
export function BookingPriceSummary({
  duration,
  base,
  discountAmt,
  discountReason,
  isFree,
  totalLabel,
}: BookingPriceSummaryProps) {
  const theme = useTheme();

  return (
    <Card elevation="sm" className="mt-lg gap-sm">
      <SummaryRow label={`Slot price (${duration}h)`} value={`Rs ${base}`} />
      {discountAmt > 0 ? (
        <SummaryRow label={discountReason ? `Discount · ${discountReason}` : 'Discount'} value={`− Rs ${discountAmt}`} />
      ) : null}
      {isFree ? <SummaryRow label="Loyalty reward" value="Free game" /> : null}
      <View className="my-xs" style={{ height: 1, backgroundColor: theme.border }} />
      <View className="flex-row items-center justify-between">
        <Typography variant="label-lg">Total</Typography>
        <Typography variant="headline-md" color={theme.primary}>
          {totalLabel}
        </Typography>
      </View>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View className="flex-row items-center justify-between">
      <Typography variant="body-md" color={theme.inkMuted}>
        {label}
      </Typography>
      <Typography variant="label-md" color={theme.ink}>
        {value}
      </Typography>
    </View>
  );
}
