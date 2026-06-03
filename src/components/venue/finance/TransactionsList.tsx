import { View } from 'react-native';

import { Card, Icon, SectionHeader, Typography } from '@/components/common';
import { TRANSACTIONS, type Txn } from '@/data/finance';
import { useTheme } from '@/hooks/use-theme';

/** Recent earnings + payouts list. */
export function TransactionsList() {
  return (
    <View className="gap-sm pt-xl">
      <SectionHeader title="Recent transactions" actionLabel="See all" />
      <Card elevation="sm">
        {TRANSACTIONS.map((t, i) => (
          <TransactionRow key={t.id} txn={t} divider={i < TRANSACTIONS.length - 1} />
        ))}
      </Card>
    </View>
  );
}

function TransactionRow({ txn, divider }: { txn: Txn; divider: boolean }) {
  const theme = useTheme();
  const credit = txn.amount.trim().startsWith('+');

  return (
    <View
      className="flex-row items-center gap-md py-md"
      style={divider ? { borderBottomWidth: 1, borderColor: theme.border } : undefined}>
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: theme.cardMuted }}>
        <Icon name={txn.icon} size={18} color={theme.primary} />
      </View>
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-md">{txn.title}</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          {txn.sub}
        </Typography>
      </View>
      <Typography variant="label-md" color={credit ? theme.primary : theme.ink}>
        {txn.amount}
      </Typography>
    </View>
  );
}
