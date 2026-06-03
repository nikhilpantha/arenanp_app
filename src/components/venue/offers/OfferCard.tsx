import { View } from 'react-native';

import { Badge, type BadgeVariant, Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { offerSummary } from '@/lib/offers';
import type { Offer, OfferStatus } from '@/types';

import { useOfferVisual } from './offer-visual';

const STATUS_BADGE: Record<OfferStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Active', variant: 'success' },
  paused: { label: 'Paused', variant: 'warning' },
  expired: { label: 'Expired', variant: 'neutral' },
};

/** One offer row — icon, title, summary and status. Tap to edit. */
export function OfferCard({ offer, onPress }: { offer: Offer; onPress?: () => void }) {
  const theme = useTheme();
  const { icon, accent } = useOfferVisual(offer);
  const badge = STATUS_BADGE[offer.status];

  return (
    <Card elevation="sm" onPress={onPress} className="flex-row items-center gap-md">
      <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${accent}1A` }}>
        <Icon name={icon} size={22} color={accent} />
      </View>
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-lg" numberOfLines={1}>
          {offer.title}
        </Typography>
        <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
          {offerSummary(offer)}
        </Typography>
      </View>
      <Badge variant={badge.variant}>{badge.label}</Badge>
    </Card>
  );
}
