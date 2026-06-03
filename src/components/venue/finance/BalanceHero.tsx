import { Pressable, View } from 'react-native';

import { Card, Icon, Typography } from '@/components/common';
import { Shadow } from '@/constants/theme';
import { BALANCE, type Period, PERIOD_LABEL } from '@/data/finance';
import { useTheme } from '@/hooks/use-theme';

const PERIODS: Period[] = ['today', 'week', 'month'];

/** Earnings balance card with a today/week/month period toggle. */
export function BalanceHero({ period, onPeriodChange }: { period: Period; onPeriodChange: (p: Period) => void }) {
  const theme = useTheme();

  return (
    <Card elevation="md" style={{ backgroundColor: theme.primary }} className="gap-lg">
      <View className="flex-row items-center justify-between">
        <Typography variant="label-sm" color="rgba(255,255,255,0.85)">
          Earnings · {PERIOD_LABEL[period].long}
        </Typography>
        <Icon name="trendingUp" size={20} color="#ffffff" />
      </View>
      <Typography variant="display-lg" color="#ffffff">
        {BALANCE[period]}
      </Typography>
      <View className="flex-row rounded-full p-[3px]" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
        {PERIODS.map((p) => {
          const active = period === p;
          return (
            <Pressable
              key={p}
              onPress={() => onPeriodChange(p)}
              className="flex-1 items-center rounded-full py-xs"
              style={active ? [{ backgroundColor: '#ffffff' }, Shadow.sm] : undefined}>
              <Typography variant="label-sm" color={active ? theme.primary : '#ffffff'} style={{ textTransform: 'none' }}>
                {PERIOD_LABEL[p].short}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
