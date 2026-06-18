import { View } from 'react-native';

import { Card, Icon, type IconName, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

/** A customer's at-a-glance performance: games, spend, last visit. */
export function CustomerStatsCard({
  games,
  spent,
  lastVisit,
}: {
  games: number;
  spent: number;
  lastVisit: string;
}) {
  const theme = useTheme();
  return (
    <Card elevation="sm" className="flex-row items-stretch">
      <Col icon="trophy" value={String(games)} label="Games" theme={theme} />
      <Divider color={theme.border} />
      <Col icon="dollarSign" value={`Rs ${spent}`} label="Spent" theme={theme} />
      <Divider color={theme.border} />
      <Col icon="calendar" value={lastVisit} label="Last visit" theme={theme} />
    </Card>
  );
}

function Col({
  icon,
  value,
  label,
  theme,
}: {
  icon: IconName;
  value: string;
  label: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View className="flex-1 items-center gap-xs">
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.cardMuted }}>
        <Icon name={icon} size={16} color={theme.primary} />
      </View>
      <Typography variant="label-lg" numberOfLines={1}>
        {value}
      </Typography>
      <Typography variant="label-sm" color={theme.inkMuted}>
        {label}
      </Typography>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={{ width: 1, backgroundColor: color }} className="my-xs" />;
}
