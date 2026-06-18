import { View } from 'react-native';

import { Badge, Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { offerSummary, type VenueOffer } from '@/lib/api/venue-offers';

/** Card list of the venue's live offers, or a loading / empty state. */
export function VenueOffersList({
  offers,
  loading,
  onOpen,
}: {
  offers: VenueOffer[];
  loading?: boolean;
  onOpen: (id: string) => void;
}) {
  const theme = useTheme();

  if (offers.length === 0) {
    return (
      <Card elevation="sm">
        <View className="items-center gap-sm py-xl">
          <Icon name="award" size={26} color={theme.inkMuted} />
          <Typography variant="body-md" color={theme.inkMuted}>
            {loading ? 'Loading offers…' : 'No offers yet. Create one to get started.'}
          </Typography>
        </View>
      </Card>
    );
  }

  return (
    <View className="gap-sm">
      {offers.map((o) => {
        const accent = o.discountType === 'FREE_GAME' ? theme.primary : theme.secondaryDark;
        return (
          <Card key={o.id} elevation="sm" onPress={() => onOpen(o.id)} className="flex-row items-center gap-md">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${accent}1A` }}>
              <Icon name={o.trigger === 'EVERY_NTH' ? 'repeat' : 'award'} size={22} color={accent} />
            </View>
            <View className="flex-1 gap-[2px]">
              <Typography variant="label-lg" numberOfLines={1}>
                {o.title}
              </Typography>
              <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
                {offerSummary(o)}
              </Typography>
            </View>
            <Badge variant={o.isActive ? 'success' : 'warning'}>{o.isActive ? 'Active' : 'Paused'}</Badge>
          </Card>
        );
      })}
    </View>
  );
}
