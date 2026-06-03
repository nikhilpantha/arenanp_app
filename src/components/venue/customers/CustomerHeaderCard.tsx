import { View } from 'react-native';

import { Avatar, Button, Card, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { Customer } from '@/types';

/** Avatar + name + phone + call action at the top of a customer detail screen. */
export function CustomerHeaderCard({ customer, onCall }: { customer: Customer; onCall: () => void }) {
  const theme = useTheme();

  return (
    <Card elevation="md" className="flex-row items-center gap-md">
      <Avatar fallback={customer.name} size={52} />
      <View className="flex-1 gap-[2px]">
        <Typography variant="headline-md">{customer.name}</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          {customer.phone}
        </Typography>
      </View>
      <Button variant="tertiary" size="sm" leftIcon="bell" onPress={onCall}>
        Call
      </Button>
    </Card>
  );
}
