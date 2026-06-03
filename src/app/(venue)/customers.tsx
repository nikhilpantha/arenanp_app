import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, SearchBar } from '@/components/common';
import { CustomerList } from '@/components/venue/customers/CustomerList';
import { CustomerStats } from '@/components/venue/customers/CustomerStats';
import { VenueHeader } from '@/components/venue/VenueHeader';
import { CUSTOMERS } from '@/data/customers';

export default function VenueCustomers() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CUSTOMERS;
    return CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [query]);

  return (
    <Screen scroll tabBarSafe>
      <VenueHeader title="Customers" />
      <View className="gap-md pb-md">
        <CustomerStats />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search by name or phone" />
      </View>

      <CustomerList
        customers={results}
        query={query}
        onOpen={(id) => router.push({ pathname: '/customer/[id]', params: { id } })}
      />
    </Screen>
  );
}
