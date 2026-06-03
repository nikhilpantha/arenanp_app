import { View } from 'react-native';

import { Badge, Button, Card, Icon, SectionHeader, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { offersForSubject, offerSummary, type SubjectOfferEntry } from '@/lib/offers';
import { useOfferStore } from '@/stores';
import type { OfferSubjectType } from '@/types';

import { useOfferVisual } from './offer-visual';

/** Offers a customer/team can use, claim or work towards. Shown on their detail screen. */
export function SubjectOffers({
  subjectType,
  subjectId,
  games,
}: {
  subjectType: OfferSubjectType;
  subjectId: string;
  games: number;
}) {
  const offers = useOfferStore((s) => s.offers);
  const claims = useOfferStore((s) => s.claims);
  const claimOffer = useOfferStore((s) => s.claimOffer);

  const entries = offersForSubject({ subjectType, games }, offers, claims, subjectId);
  if (entries.length === 0) return null;

  return (
    <View className="gap-sm">
      <SectionHeader title="Offers" subtitle="Loyalty, discounts & promos" />
      <Card elevation="sm">
        {entries.map((entry, i) => (
          <OfferRow
            key={entry.offer.id}
            entry={entry}
            divider={i < entries.length - 1}
            onGrant={() => claimOffer(entry.offer.id, subjectType, subjectId)}
          />
        ))}
      </Card>
    </View>
  );
}

function OfferRow({
  entry,
  divider,
  onGrant,
}: {
  entry: SubjectOfferEntry;
  divider: boolean;
  onGrant: () => void;
}) {
  const theme = useTheme();
  const { offer, progress, claim } = entry;
  const { icon, accent } = useOfferVisual(offer);

  return (
    <View
      className="flex-row items-center gap-md py-md"
      style={divider ? { borderBottomWidth: 1, borderColor: theme.border } : undefined}>
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1A` }}>
        <Icon name={icon} size={18} color={accent} />
      </View>
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-md" numberOfLines={1}>
          {offer.title}
        </Typography>
        <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
          {offerSummary(offer)}
        </Typography>
      </View>
      <OfferStatus entry={entry} onGrant={onGrant} progressReady={progress?.ready} toNext={progress?.toNext} claimed={Boolean(claim)} />
    </View>
  );
}

function OfferStatus({
  entry,
  onGrant,
  progressReady,
  toNext,
  claimed,
}: {
  entry: SubjectOfferEntry;
  onGrant: () => void;
  progressReady?: boolean;
  toNext?: number;
  claimed: boolean;
}) {
  if (entry.offer.trigger === 'manual') {
    return claimed ? (
      <Badge variant="success">Claimed</Badge>
    ) : (
      <Button variant="tertiary" size="sm" onPress={onGrant}>
        Grant
      </Button>
    );
  }
  if (entry.offer.trigger === 'happy-hour') {
    return <Badge variant="info">Auto</Badge>;
  }
  // every-nth
  return progressReady ? (
    <Badge variant="success">🎉 Ready</Badge>
  ) : (
    <Badge variant="neutral">{`${toNext ?? 0} to go`}</Badge>
  );
}
