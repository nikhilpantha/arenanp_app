import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, Screen, SearchBar, Typography } from '@/components/common';
import { VenueCustomerList } from '@/components/venue/customers/VenueCustomerList';
import { VenueHeader } from '@/components/venue/VenueHeader';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useRefresh } from '@/hooks/use-refresh';
import { useTheme } from '@/hooks/use-theme';
import { useVenueCustomers } from '@/lib/api/venue-customers';

export default function VenueCustomers() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const debouncedQuery = useDebouncedValue(query, 300);
  const customersQ = useVenueCustomers(debouncedQuery);
  const { refreshing, onRefresh } = useRefresh(customersQ);
  const customers = customersQ.data ?? [];
  const freeGamesDue = customers.filter((c) => c.freeGameReady).length;

  return (
    <Screen tabBarSafe>
      <VenueHeader title="Customers" />
      <View className="gap-md pb-md">
        <View className="flex-row gap-sm">
          <Stat value={String(customers.length)} label="Customers" theme={theme} />
          <Stat value={String(freeGamesDue)} label="Free games due" tint={theme.secondaryDark} theme={theme} />
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search by name or phone" />
      </View>

      <VenueCustomerList
        customers={customers}
        query={query}
        loading={customersQ.isLoading}
        error={customersQ.isError}
        loadingMore={customersQ.isFetchingNextPage}
        onEndReached={() => {
          if (customersQ.hasNextPage && !customersQ.isFetchingNextPage) customersQ.fetchNextPage();
        }}
        onRetry={() => customersQ.refetch()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onOpen={(c) => router.push({ pathname: '/customer/[id]', params: { id: c.id } })}
      />
    </Screen>
  );
}

function Stat({ value, label, tint, theme }: { value: string; label: string; tint?: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <Card elevation="sm" className="flex-1 gap-[2px]">
      <Typography variant="headline-md" color={tint}>
        {value}
      </Typography>
      <Typography variant="label-sm" color={theme.inkMuted}>
        {label}
      </Typography>
    </Card>
  );
}
