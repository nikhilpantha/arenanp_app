import { useState } from 'react';
import { View } from 'react-native';

import { Button, Screen } from '@/components/common';
import { BalanceHero } from '@/components/venue/finance/BalanceHero';
import { TransactionsList } from '@/components/venue/finance/TransactionsList';
import { VenueHeader } from '@/components/venue/VenueHeader';
import type { Period } from '@/data/finance';

export default function VenueFinance() {
  const [period, setPeriod] = useState<Period>('today');

  return (
    <Screen scroll tabBarSafe>
      <VenueHeader title="Finance" />

      <BalanceHero period={period} onPeriodChange={setPeriod} />

      <View className="pt-md">
        <Button variant="primary" size="lg" fullWidth rightIcon="arrowRight" className="rounded-full">
          Withdraw to bank
        </Button>
      </View>

      <TransactionsList />
    </Screen>
  );
}
