import { View } from 'react-native';

import { Card, Icon, SectionHeader, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { Offer } from '@/types';

import { OfferCard } from './OfferCard';

/** Active + paused offer groups. Empty state when the owner has none yet. */
export function OffersList({ offers, onOpen }: { offers: Offer[]; onOpen: (id: string) => void }) {
  const theme = useTheme();
  const active = offers.filter((o) => o.status === 'active');
  const paused = offers.filter((o) => o.status !== 'active');

  if (offers.length === 0) {
    return (
      <Card elevation="md" className="items-center gap-sm py-xl">
        <Icon name="percent" size={28} color={theme.primary} />
        <Typography variant="label-lg">No offers yet</Typography>
        <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
          Create loyalty, discount or happy-hour offers to reward your customers.
        </Typography>
      </Card>
    );
  }

  return (
    <View className="gap-lg">
      {active.length > 0 ? (
        <View className="gap-sm">
          <SectionHeader title="Active" />
          {active.map((o) => (
            <OfferCard key={o.id} offer={o} onPress={() => onOpen(o.id)} />
          ))}
        </View>
      ) : null}

      {paused.length > 0 ? (
        <View className="gap-sm">
          <SectionHeader title="Paused" />
          {paused.map((o) => (
            <OfferCard key={o.id} offer={o} onPress={() => onOpen(o.id)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
