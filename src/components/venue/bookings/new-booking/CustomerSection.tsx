import { Pressable, View } from 'react-native';

import { Card, Icon, Typography } from '@/components/common';
import type { PickedCustomer } from '@/components/venue/bookings/CustomerPicker';
import { LoyaltyHintCard } from '@/components/venue/bookings/LoyaltyHintCard';
import { useTheme } from '@/hooks/use-theme';
import type { LoyaltyState } from '@/lib/loyalty';

/** Pick / show the customer the booking is for, plus their loyalty hint. */
export function CustomerSection({
  customer,
  loyalty,
  isNew,
  onOpenPicker,
}: {
  customer: PickedCustomer | null;
  loyalty: LoyaltyState | null;
  isNew: boolean;
  onOpenPicker: () => void;
}) {
  const theme = useTheme();

  return (
    <View className="gap-sm pt-lg">
      <Typography variant="label-md" color={theme.inkMuted}>
        Select a customer
      </Typography>
      {customer ? (
        <View className="gap-sm">
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

          {loyalty || isNew ? (
            <LoyaltyHintCard name={customer.name} loyalty={loyalty} isNew={isNew} />
          ) : null}
        </View>
      ) : (
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
      )}
    </View>
  );
}
