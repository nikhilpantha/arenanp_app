import { Pressable, View } from 'react-native';

import { Icon, Input, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { offerDiscount, type PlayerOffer } from '@/lib/api/player-bookings';

/** Selectable list of the venue's offers + a manual promo-code field. */
export function OfferPicker({
  offers,
  selected,
  onSelect,
  code,
  onCode,
  subtotal,
}: {
  offers: PlayerOffer[];
  selected: PlayerOffer | null;
  onSelect: (offer: PlayerOffer | null) => void;
  code: string;
  onCode: (v: string) => void;
  subtotal: number;
}) {
  const theme = useTheme();
  if (offers.length === 0) {
    return (
      <View className="gap-sm">
        <Typography variant="label-lg">Promo code</Typography>
        <Input value={code} onChangeText={onCode} placeholder="Have a code?" autoCapitalize="characters" />
      </View>
    );
  }

  return (
    <View className="gap-sm">
      <Typography variant="label-lg">Offers</Typography>
      {offers.map((o) => {
        const active = selected?.id === o.id;
        const off = offerDiscount(o, subtotal);
        return (
          <Pressable
            key={o.id}
            onPress={() => onSelect(active ? null : o)}
            className="flex-row items-center gap-md rounded-2xl p-md"
            style={{
              backgroundColor: active ? `${theme.primary}14` : theme.card,
              borderWidth: 1,
              borderColor: active ? theme.primary : theme.border,
            }}>
            <Icon name="percent" size={18} color={theme.primary} />
            <View className="flex-1 gap-[2px]">
              <Typography variant="label-md">{o.title}</Typography>
              <Typography variant="body-md" color={theme.inkMuted}>
                {o.code}
                {off > 0 ? ` · Save Rs ${off}` : o.minSubtotal > subtotal ? ` · Min Rs ${o.minSubtotal}` : ''}
              </Typography>
            </View>
            <Icon name={active ? 'check' : 'plus'} size={18} color={active ? theme.primary : theme.inkMuted} />
          </Pressable>
        );
      })}
      <Input value={code} onChangeText={onCode} placeholder="Or enter a code" autoCapitalize="characters" />
    </View>
  );
}
