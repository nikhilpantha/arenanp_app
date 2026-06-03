import { View } from 'react-native';

import { Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { offersForSubject, rewardLabel, type SubjectOfferEntry } from '@/lib/offers';
import { useOfferStore } from '@/stores';
import type { DayOfWeek, OfferSubjectType, SportType } from '@/types';

import { useOfferVisual } from './offer-visual';

/** Offer picker shown in new-booking — only offers that can be applied right now. */
export function OfferSelect({
  subjectType,
  subjectId,
  games,
  sport,
  day,
  hour,
  selectedId,
  onChange,
}: {
  subjectType: OfferSubjectType;
  subjectId: string;
  games: number;
  sport?: SportType;
  day?: DayOfWeek;
  hour?: number;
  selectedId: string | null;
  onChange: (entry: SubjectOfferEntry | null) => void;
}) {
  const theme = useTheme();
  const offers = useOfferStore((s) => s.offers);
  const claims = useOfferStore((s) => s.claims);

  const ready = offersForSubject({ subjectType, games, sport, day, hour }, offers, claims, subjectId).filter(
    (e) => e.ready,
  );
  if (ready.length === 0) return null;

  return (
    <View className="gap-sm pt-lg">
      <Typography variant="label-md" color={theme.inkMuted}>
        Apply an offer
      </Typography>
      <View className="gap-sm">
        {ready.map((entry) => (
          <OfferOption
            key={entry.offer.id}
            entry={entry}
            selected={selectedId === entry.offer.id}
            onPress={() => onChange(selectedId === entry.offer.id ? null : entry)}
          />
        ))}
      </View>
    </View>
  );
}

function OfferOption({
  entry,
  selected,
  onPress,
}: {
  entry: SubjectOfferEntry;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { icon, accent } = useOfferVisual(entry.offer);

  return (
    <Card
      elevation={selected ? 'md' : 'sm'}
      onPress={onPress}
      style={selected ? { borderWidth: 1.5, borderColor: theme.primary, backgroundColor: `${theme.primary}0D` } : undefined}
      className="flex-row items-center gap-md">
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1A` }}>
        <Icon name={icon} size={18} color={accent} />
      </View>
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-md" numberOfLines={1}>
          {entry.offer.title}
        </Typography>
        <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
          {rewardLabel(entry.offer)}
          {entry.claim ? ' · claimed' : ''}
        </Typography>
      </View>
      <View
        className="h-6 w-6 items-center justify-center rounded-full"
        style={{
          borderWidth: 2,
          borderColor: selected ? theme.primary : theme.border,
          backgroundColor: selected ? theme.primary : 'transparent',
        }}>
        {selected ? <Icon name="check" size={14} color="#ffffff" /> : null}
      </View>
    </Card>
  );
}
