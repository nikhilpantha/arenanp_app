import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, Input, ModalBackdrop, Segmented, Typography } from '@/components/common';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AdditionalService, PaymentMethod, PaymentStatus } from '@/types';

export interface CompleteBookingPayload {
  extras: { name: string; price: number }[];
  paymentStatus: PaymentStatus;
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
}

interface CustomExtra {
  name: string;
  price: string;
}

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'esewa', label: 'eSewa' },
  { value: 'khalti', label: 'Khalti' },
  { value: 'card', label: 'Card' },
];

const toAmount = (text: string): number => {
  const digits = text.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
};

/**
 * "Mark complete" flow: pick the add-on services the customer used (from the
 * venue's saved list and/or one-off custom items), see the recomputed total, and
 * capture final payment. The parent owns `visible` so it stays open on error.
 *
 * Built self-contained on the same bottom-sheet shape as the app's select sheets
 * (TimeSelect / VenueSwitcherSheet): a dim backdrop with the sheet as a direct
 * child of a `flex:1` container, so `maxHeight` resolves against the full screen.
 * The header and footer are pinned; only the middle body scrolls (`flexShrink`),
 * which keeps the Complete / Cancel buttons inside the sheet at any content height.
 */
export function CompleteBookingModal({
  visible,
  onClose,
  onConfirm,
  basePrice,
  services,
  loading = false,
  error,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (payload: CompleteBookingPayload) => void;
  /** The booking's price before extras (court charge after any discount). */
  basePrice: number;
  /** The venue's saved additional services. */
  services: AdditionalService[];
  loading?: boolean;
  error?: string | null;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [picked, setPicked] = useState<Set<number>>(() => new Set());
  const [custom, setCustom] = useState<CustomExtra[]>([]);
  const [method, setMethod] = useState<PaymentMethod>('cash');

  const togglePicked = (i: number) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const extras = useMemo(() => {
    const fromSaved = services
      .map((s, i) => ({ name: s.name, price: s.price ?? 0, i }))
      .filter((s) => picked.has(s.i))
      .map((s) => ({ name: s.name, price: s.price }));
    const fromCustom = custom
      .filter((c) => c.name.trim())
      .map((c) => ({ name: c.name.trim(), price: toAmount(c.price) }));
    return [...fromSaved, ...fromCustom];
  }, [services, picked, custom]);

  const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
  const total = Math.max(0, basePrice) + extrasTotal;

  const dismiss = loading ? undefined : onClose;

  // Completing a booking always settles it in full — the bill is marked paid.
  const submit = () =>
    onConfirm({
      extras,
      paymentStatus: 'paid',
      amountPaid: total,
      paymentMethod: method,
    });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop and sheet are SIBLINGS (not parent→child): the sheet then has a
          single Pressable ancestor, so vertical pans anywhere on the body reach the
          ScrollView instead of being swallowed by the backdrop. */}
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <ModalBackdrop onPress={dismiss} />
        <Pressable
          style={{
            backgroundColor: theme.bg,
            borderTopLeftRadius: Radius['3xl'],
            borderTopRightRadius: Radius['3xl'],
            paddingTop: Spacing.sm,
            maxHeight: '88%',
          }}>
          {/* Pinned grabber */}
          <View className="items-center pb-sm">
            <View className="h-1 w-10 rounded-full" style={{ backgroundColor: theme.border }} />
          </View>

          {/* Everything scrolls together — header, body and the action buttons. */}
          <ScrollView
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: Spacing.lg,
              paddingHorizontal: Spacing.lg,
              paddingBottom: insets.bottom + Spacing.lg,
            }}>
            <View className="gap-xs">
              <Typography variant="headline-md">Complete booking</Typography>
              <Typography variant="body-md" color={theme.inkMuted}>
                Add anything the customer used, then settle the bill.
              </Typography>
            </View>

            {/* Saved add-on services */}
            {services.length ? (
              <View className="gap-sm">
                <Typography variant="label-md" color={theme.inkMuted}>
                  Add-ons used
                </Typography>
                {services.map((s, i) => {
                  const on = picked.has(i);
                  return (
                    <Pressable
                      key={`${s.name}-${i}`}
                      onPress={() => togglePicked(i)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      className="flex-row items-center gap-md rounded-2xl border p-md"
                      style={{
                        borderColor: on ? theme.primary : theme.border,
                        backgroundColor: on ? `${theme.primary}0D` : theme.card,
                      }}>
                      <View
                        className="h-5 w-5 items-center justify-center rounded-md border-2"
                        style={{
                          borderColor: on ? theme.primary : theme.border,
                          backgroundColor: on ? theme.primary : 'transparent',
                        }}>
                        {on ? <Icon name="check" size={12} color="#ffffff" /> : null}
                      </View>
                      <Typography variant="label-md" style={{ flex: 1 }}>
                        {s.name}
                      </Typography>
                      <Typography variant="label-md" color={theme.inkMuted}>
                        {s.price ? `Rs ${s.price}` : 'Free'}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {/* Custom one-off items */}
            <View className="gap-sm">
              <Typography variant="label-md" color={theme.inkMuted}>
                Custom items
              </Typography>
              {custom.map((c, i) => (
                <View key={i} className="flex-row items-center gap-sm">
                  <View className="flex-1">
                    <Input
                      placeholder="Item name"
                      value={c.name}
                      onChangeText={(t) =>
                        setCustom((list) => list.map((x, j) => (j === i ? { ...x, name: t } : x)))
                      }
                    />
                  </View>
                  <View style={{ width: 110 }}>
                    <Input
                      placeholder="Rs"
                      keyboardType="number-pad"
                      value={c.price}
                      onChangeText={(t) =>
                        setCustom((list) => list.map((x, j) => (j === i ? { ...x, price: t } : x)))
                      }
                    />
                  </View>
                  <Pressable
                    onPress={() => setCustom((list) => list.filter((_, j) => j !== i))}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="Remove item"
                    className="h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: theme.cardMuted }}>
                    <Icon name="x" size={14} color={theme.inkMuted} />
                  </Pressable>
                </View>
              ))}
              <Pressable
                onPress={() => setCustom((list) => [...list, { name: '', price: '' }])}
                accessibilityRole="button"
                className="flex-row items-center gap-xs self-start">
                <Icon name="plus" size={18} color={theme.primary} />
                <Typography variant="label-md" color={theme.primary}>
                  Add custom item
                </Typography>
              </Pressable>
            </View>

            {/* Bill summary */}
            <View className="gap-sm rounded-2xl p-md" style={{ backgroundColor: theme.cardMuted }}>
              <Row
                label="Court charge"
                value={`Rs ${Math.max(0, basePrice)}`}
                muted
                theme={theme}
              />
              <Row label="Add-ons" value={`Rs ${extrasTotal}`} muted theme={theme} />
              <View className="h-px" style={{ backgroundColor: theme.border }} />
              <View className="flex-row items-center justify-between">
                <Typography variant="label-lg">Total</Typography>
                <Typography variant="label-lg" color={theme.primary}>
                  Rs {total}
                </Typography>
              </View>
            </View>

            {/* Payment — completing a booking always marks it paid in full;
                only the method is captured. */}
            <View className="gap-sm">
              <Typography variant="label-md" color={theme.inkMuted}>
                Paid via
              </Typography>
              <Segmented
                options={PAYMENT_METHOD_OPTIONS}
                value={method}
                onChange={(v) => setMethod(v as PaymentMethod)}
              />
            </View>

            {/* Actions — part of the scroll content, not pinned. */}
            <View className="gap-sm">
              {error ? (
                <View
                  className="rounded-2xl px-md py-sm"
                  style={{ backgroundColor: `${theme.danger}14` }}>
                  <Typography variant="body-md" color={theme.danger}>
                    {error}
                  </Typography>
                </View>
              ) : null}
              <Button
                size="lg"
                fullWidth
                className="rounded-full"
                rightIcon="check"
                loading={loading}
                onPress={submit}>
                {`Complete · Rs ${total}`}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                className="rounded-full"
                disabled={loading}
                onPress={onClose}>
                Cancel
              </Button>
            </View>
          </ScrollView>
        </Pressable>
      </View>
    </Modal>
  );
}

function Row({
  label,
  value,
  muted,
  theme,
}: {
  label: string;
  value: string;
  muted?: boolean;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Typography variant="body-md" color={muted ? theme.inkMuted : theme.ink}>
        {label}
      </Typography>
      <Typography variant="body-md" color={muted ? theme.inkMuted : theme.ink}>
        {value}
      </Typography>
    </View>
  );
}
