import { Pressable, View } from 'react-native';

import { Icon, Input, Segmented, Typography } from '@/components/common';
import { PAYMENT_METHODS, PAYMENT_OPTIONS } from '@/constants/bookings';
import { useTheme } from '@/hooks/use-theme';
import type { PaymentMethod, PaymentStatus } from '@/types';

/** Payment status (paid / partial / pending) + method + partial-amount entry. */
export function PaymentSection({
  status,
  onStatus,
  amountPaid,
  onAmountPaid,
  method,
  onMethod,
  paid,
  remaining,
  total,
}: {
  status: PaymentStatus;
  onStatus: (s: PaymentStatus) => void;
  amountPaid: string;
  onAmountPaid: (v: string) => void;
  method: PaymentMethod;
  onMethod: (m: PaymentMethod) => void;
  paid: number;
  remaining: number;
  total: number;
}) {
  const theme = useTheme();
  return (
    <View className="gap-sm pt-lg">
      <Typography variant="label-md" color={theme.inkMuted}>
        Payment
      </Typography>

      <View className="gap-sm">
        {PAYMENT_OPTIONS.map((opt) => {
          const active = status === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onStatus(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="flex-row items-center gap-md rounded-2xl border p-md"
              style={{
                borderColor: active ? theme.primary : theme.border,
                backgroundColor: active ? `${theme.primary}0D` : theme.card,
              }}>
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: active ? theme.primary : theme.cardMuted }}>
                <Icon name={opt.icon} size={18} color={active ? '#ffffff' : theme.inkMuted} />
              </View>
              <View className="flex-1">
                <Typography variant="label-lg">{opt.label}</Typography>
                <Typography variant="body-md" color={theme.inkMuted}>
                  {opt.hint}
                </Typography>
              </View>
              <View
                className="h-5 w-5 items-center justify-center rounded-full border-2"
                style={{ borderColor: active ? theme.primary : theme.border }}>
                {active ? (
                  <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {status === 'partial' ? (
        <View className="gap-xs pt-sm">
          <Input
            value={amountPaid}
            onChangeText={onAmountPaid}
            placeholder={`Amount paid now (e.g. ${Math.round(total / 2)})`}
            keyboardType="number-pad"
            leftIcon="dollarSign"
          />
          <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
            Rs {paid} paid · Rs {remaining} remaining
          </Typography>
        </View>
      ) : null}

      {status !== 'pending' ? (
        <View className="gap-sm pt-sm">
          <Typography variant="label-md" color={theme.inkMuted}>
            How did they pay?
          </Typography>
          <Segmented options={PAYMENT_METHODS} value={method} onChange={(v) => onMethod(v as PaymentMethod)} />
        </View>
      ) : null}
    </View>
  );
}
