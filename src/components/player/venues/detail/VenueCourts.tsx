import { View } from 'react-native';

import { Button, Card, Icon, SportGlyph, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { PublicCourtData } from '@/lib/api/discovery';
import { sessionLengthLabel } from '@/lib/subscription-format';

interface SportGroup {
  slug: string;
  name: string;
  courts: PublicCourtData[];
}

function groupBySport(courts: PublicCourtData[]): SportGroup[] {
  const map = new Map<string, SportGroup>();
  for (const c of courts) {
    const g = map.get(c.sport.slug) ?? { slug: c.sport.slug, name: c.sport.name, courts: [] };
    g.courts.push(c);
    map.set(c.sport.slug, g);
  }
  return [...map.values()];
}

/** One tappable court row. */
function CourtRow({ court, onBook }: { court: PublicCourtData; onBook: () => void }) {
  const theme = useTheme();
  return (
    <Card elevation="sm" onPress={onBook} className="flex-row items-center gap-md">
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-md">{court.name}</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          {sessionLengthLabel(court.slotMinutes)} slots
        </Typography>
      </View>
      <Typography variant="label-md" color={theme.primary} style={{ textTransform: 'none' }}>
        Rs {court.pricePerHour}/hr
      </Typography>
      <Icon name="chevronRight" size={18} color={theme.inkMuted} />
    </Card>
  );
}

/**
 * The bookable courts. A single-court venue reads as one offering — the venue itself is
 * the court (a prominent card). Otherwise courts are listed, grouped by sport only when
 * the venue spans more than one sport (no redundant header for single-sport venues).
 */
export function VenueCourts({
  courts,
  venueName,
  onBook,
}: {
  courts: PublicCourtData[];
  venueName: string;
  onBook: (court: PublicCourtData) => void;
}) {
  const theme = useTheme();
  if (courts.length === 0) return null;

  // Single court → the venue *is* the court.
  if (courts.length === 1) {
    const c = courts[0];
    return (
      <View className="gap-sm">
        <Typography variant="label-lg">Court</Typography>
        <Card elevation="md" className="gap-md">
          <View className="flex-row items-center gap-md">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: theme.cardMuted }}>
              <SportGlyph slug={c.sport.slug} size={28} />
            </View>
            <View className="flex-1 gap-[2px]">
              <Typography variant="label-lg" numberOfLines={1}>
                {venueName}
              </Typography>
              <Typography variant="body-md" color={theme.inkMuted}>
                {c.sport.name} · {sessionLengthLabel(c.slotMinutes)} slots
              </Typography>
            </View>
            <View className="items-end">
              <Typography variant="headline-md" color={theme.primary}>
                Rs {c.pricePerHour}
              </Typography>
              <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                /hour
              </Typography>
            </View>
          </View>
          <Button size="md" fullWidth className="rounded-full" rightIcon="arrowRight" onPress={() => onBook(c)}>
            Select time
          </Button>
        </Card>
      </View>
    );
  }

  const groups = groupBySport(courts);
  const multiSport = groups.length > 1;

  return (
    <View className="gap-md">
      <Typography variant="label-lg">Courts</Typography>
      {groups.map((g) => (
        <View key={g.slug} className="gap-sm">
          {multiSport ? (
            <View className="flex-row items-center gap-xs">
              <SportGlyph slug={g.slug} size={20} />
              <Typography variant="label-md">{g.name}</Typography>
              <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
                · {g.courts.length === 1 ? '1 court' : `${g.courts.length} courts`}
              </Typography>
            </View>
          ) : null}
          {g.courts.map((c) => (
            <CourtRow key={c.id} court={c} onBook={() => onBook(c)} />
          ))}
        </View>
      ))}
    </View>
  );
}
