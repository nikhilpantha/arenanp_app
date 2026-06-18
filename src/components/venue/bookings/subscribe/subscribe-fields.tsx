import { Pressable, View } from 'react-native';

import { Card, Icon, Typography } from '@/components/common';
import type { PickedCustomer } from '@/components/venue/bookings/CustomerPicker';
import { useTheme } from '@/hooks/use-theme';

/** A numbered form step with a title and a done check — gives the screen a guided feel. */
export function Step({
  index,
  title,
  done,
  children,
}: {
  index: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View className="gap-sm pt-lg">
      <View className="flex-row items-center gap-sm">
        <View
          className="h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: done ? theme.primary : theme.cardMuted }}>
          {done ? (
            <Icon name="check" size={13} color="#ffffff" />
          ) : (
            <Typography variant="label-sm" color={theme.inkMuted}>
              {String(index)}
            </Typography>
          )}
        </View>
        <Typography variant="label-lg">{title}</Typography>
      </View>
      {children}
    </View>
  );
}

/** A selectable option styled with a leading radio dot so it's clearly tappable. */
export function RadioCard({
  title,
  meta,
  selected,
  onPress,
}: {
  title: string;
  meta?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Card
      elevation={selected ? 'md' : 'sm'}
      onPress={onPress}
      style={{ borderWidth: 1.5, borderColor: selected ? theme.primary : 'transparent' }}
      className="flex-row items-center gap-md">
      <View
        className="h-5 w-5 items-center justify-center rounded-full"
        style={{ borderWidth: 2, borderColor: selected ? theme.primary : theme.border }}>
        {selected ? (
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.primary }} />
        ) : null}
      </View>
      <View className="flex-1">
        <Typography variant="label-lg">{title}</Typography>
        {meta ? (
          <Typography variant="body-md" color={theme.inkMuted}>
            {meta}
          </Typography>
        ) : null}
      </View>
    </Card>
  );
}

/** Inline, form-style validation error shown beneath a field (sentence case, not a toast). */
export function FieldError({ message }: { message?: string }) {
  const theme = useTheme();
  if (!message) return null;
  return (
    <Typography variant="body-md" color={theme.danger}>
      {message}
    </Typography>
  );
}

/** Customer field: tap to pick/add, then a compact card with a Change action. */
export function CustomerField({
  customer,
  onOpenPicker,
}: {
  customer: PickedCustomer | null;
  onOpenPicker: () => void;
}) {
  const theme = useTheme();
  if (customer) {
    return (
      <Card elevation="sm" className="flex-row items-center gap-md">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: theme.cardMuted }}>
          <Icon name="user" size={22} color={theme.primary} />
        </View>
        <View className="flex-1">
          <Typography variant="label-lg">{customer.name}</Typography>
          {customer.phone ? (
            <Typography variant="body-md" color={theme.inkMuted}>
              {customer.phone}
            </Typography>
          ) : null}
        </View>
        <Pressable onPress={onOpenPicker} hitSlop={8}>
          <Typography variant="label-md" color={theme.primary}>
            Change
          </Typography>
        </Pressable>
      </Card>
    );
  }
  return (
    <Pressable
      onPress={onOpenPicker}
      className="items-center justify-center gap-sm rounded-3xl border-2 border-dashed py-xl"
      style={{ borderColor: theme.primary, backgroundColor: `${theme.primary}0D` }}>
      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `${theme.primary}1A` }}>
        <Icon name="user" size={26} color={theme.primary} />
      </View>
      <Typography variant="label-lg" color={theme.primary}>
        Select customer
      </Typography>
      <Typography variant="body-md" color={theme.inkMuted}>
        Search an existing customer or add a new one
      </Typography>
    </Pressable>
  );
}

/** A label/value row for the confirmation summary card. */
export function SummaryRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View className="flex-row items-center justify-between gap-md">
      <Typography variant="body-md" color={theme.inkMuted}>
        {label}
      </Typography>
      <Typography variant="label-md" numberOfLines={1} style={{ flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Typography>
    </View>
  );
}
