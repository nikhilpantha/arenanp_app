import { Pressable, View } from 'react-native';

import { Avatar, Badge, Card, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { computeLoyalty } from '@/lib/loyalty';
import type { Customer } from '@/types';

/** Card list of customers with their loyalty status, or an empty state. */
export function CustomerList({
  customers,
  query,
  onOpen,
}: {
  customers: Customer[];
  query: string;
  onOpen: (id: string) => void;
}) {
  const theme = useTheme();

  if (customers.length === 0) {
    return (
      <Card elevation="sm">
        <View className="items-center gap-sm py-xl">
          <Icon name="users" size={26} color={theme.inkMuted} />
          <Typography variant="body-md" color={theme.inkMuted}>
            No customers match “{query}”.
          </Typography>
        </View>
      </Card>
    );
  }

  return (
    <Card elevation="sm">
      {customers.map((c, i) => (
        <CustomerRow key={c.id} customer={c} divider={i < customers.length - 1} onPress={() => onOpen(c.id)} />
      ))}
    </Card>
  );
}

function CustomerRow({ customer, divider, onPress }: { customer: Customer; divider: boolean; onPress: () => void }) {
  const theme = useTheme();
  const loyalty = computeLoyalty(customer.gamesPlayed);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-md py-md"
      style={({ pressed }) => [
        { opacity: pressed ? 0.92 : 1 },
        divider ? { borderBottomWidth: 1, borderColor: theme.border } : null,
      ]}>
      <Avatar fallback={customer.name} size={44} />
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-md">{customer.name}</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          {customer.phone} · {customer.gamesPlayed} games
        </Typography>
      </View>
      {loyalty.isFreeNext ? (
        <Badge variant="success">🎉 Free game</Badge>
      ) : (
        <Badge variant="neutral">{`${loyalty.toNextFree} to free`}</Badge>
      )}
    </Pressable>
  );
}
