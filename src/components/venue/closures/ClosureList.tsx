import { Alert, Pressable, View } from 'react-native';

import { Badge, Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { VenueClosure } from '@/lib/api/closures';
import type { VenueCourtOption } from '@/lib/api/venue-bookings';
import { formatClosureWindow } from '@/lib/closure-format';

interface Props {
  closures: VenueClosure[];
  courts: VenueCourtOption[];
  loading?: boolean;
  onDelete: (id: string) => void;
}

/** Upcoming closures, soonest first, each removable with a confirm. */
export function ClosureList({ closures, courts, loading, onDelete }: Props) {
  const theme = useTheme();

  if (loading) {
    return (
      <Typography variant="body-md" color={theme.inkMuted}>
        Loading…
      </Typography>
    );
  }
  if (closures.length === 0) {
    return (
      <Card elevation="sm" className="items-center gap-sm py-xl">
        <Icon name="calendar" size={26} color={theme.inkMuted} />
        <Typography variant="label-lg">No blocks scheduled</Typography>
        <Typography variant="body-md" color={theme.inkMuted} style={{ textAlign: 'center' }}>
          Block a court for a few hours or close the venue for several days.
        </Typography>
      </Card>
    );
  }

  const confirmDelete = (c: VenueClosure) =>
    Alert.alert('Remove this block?', 'Bookings will open back up for this time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onDelete(c.id) },
    ]);

  return (
    <View className="gap-sm">
      {closures.map((c) => {
        const court = c.courtId ? courts.find((x) => x.id === c.courtId) : null;
        const scope = c.courtId ? (court?.name ?? 'Court') : 'Whole venue';
        return (
          <Card key={c.id} elevation="sm" className="flex-row items-center gap-md">
            <View className="flex-1 gap-[2px]">
              <View className="flex-row items-center gap-sm">
                <Typography variant="label-lg">{formatClosureWindow(c)}</Typography>
                <Badge variant={c.courtId ? 'neutral' : 'warning'}>{scope}</Badge>
              </View>
              {c.reason ? (
                <Typography variant="body-md" color={theme.inkMuted}>
                  {c.reason}
                </Typography>
              ) : null}
            </View>
            <Pressable onPress={() => confirmDelete(c)} hitSlop={8}>
              <Icon name="x" size={20} color={theme.danger} />
            </Pressable>
          </Card>
        );
      })}
    </View>
  );
}
