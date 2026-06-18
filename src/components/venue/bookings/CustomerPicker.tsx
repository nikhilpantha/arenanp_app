import { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, Icon, Input, KeyboardView, PhoneInput, SearchBar, Typography } from '@/components/common';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTheme } from '@/hooks/use-theme';
import { useCreateVenueCustomer, useVenueCustomers, type VenueCustomer } from '@/lib/api/venue-customers';

export interface PickedCustomer {
  id: string;
  name: string;
  phone?: string;
}

/**
 * Bottom sheet to pick the customer a booking is for: search the venue's existing
 * customers and tap one, or add a new customer inline (name + phone). Adding saves
 * the customer to the venue's list (deduped by phone) and returns it selected.
 */
export function CustomerPicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (customer: PickedCustomer) => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [query, setQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 300);
  const customersQ = useVenueCustomers(debouncedQuery);
  const customers = customersQ.data ?? [];
  const createCustomer = useCreateVenueCustomer();

  const reset = () => {
    setMode('list');
    setQuery('');
    setNewName('');
    setNewPhone('');
    setError(null);
  };
  const close = () => {
    reset();
    onClose();
  };
  const pick = (c: VenueCustomer) => {
    onSelect({ id: c.id, name: c.name, phone: c.phone });
    close();
  };

  const submitCreate = async () => {
    const name = newName.trim();
    if (name.length < 2) return setError('Enter a customer name.');
    if (newPhone && newPhone.length !== 10) return setError('Enter a 10-digit mobile number.');
    setError(null);
    try {
      const created = await createCustomer.mutateAsync({ name, phone: newPhone || undefined });
      pick(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the customer. Please try again.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardView behavior="padding">
        <Pressable className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={close}>
          <Pressable
            onPress={() => {}}
            className="rounded-t-3xl"
            style={{ backgroundColor: theme.bg, maxHeight: '82%', paddingBottom: insets.bottom + 16 }}>
            <View className="items-center pb-md pt-sm">
              <View className="h-1 w-10 rounded-full" style={{ backgroundColor: theme.cardSunken }} />
            </View>

            {mode === 'list' ? (
              <>
                <View className="gap-md px-lg">
                  <Typography variant="headline-md">Select customer</Typography>
                  <SearchBar
                    value={query}
                    onChangeText={setQuery}
                    onClear={() => setQuery('')}
                    placeholder="Search by name or phone"
                  />
                </View>

                <FlatList
                  className="px-lg"
                  style={{ flexShrink: 1 }}
                  data={customers}
                  keyExtractor={(c) => c.id}
                  contentContainerStyle={{ paddingVertical: 12, gap: 8 }}
                  keyboardShouldPersistTaps="handled"
                  onEndReachedThreshold={0.4}
                  onEndReached={() => {
                    if (customersQ.hasNextPage && !customersQ.isFetchingNextPage)
                      customersQ.fetchNextPage();
                  }}
                  renderItem={({ item: c }) => (
                    <Card
                      elevation="sm"
                      onPress={() => pick(c)}
                      className="flex-row items-center gap-md">
                      <View
                        className="h-11 w-11 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: theme.cardMuted }}>
                        <Icon name="user" size={20} color={theme.primary} />
                      </View>
                      <View className="flex-1">
                        <Typography variant="label-lg" numberOfLines={1}>
                          {c.name}
                        </Typography>
                        <Typography variant="body-md" color={theme.inkMuted} numberOfLines={1}>
                          {c.phone ? `${c.phone} · ` : ''}
                          {c.gamesPlayed} games
                        </Typography>
                      </View>
                      {c.freeGameReady ? <Badge variant="success">🎉 Free</Badge> : null}
                    </Card>
                  )}
                  ListEmptyComponent={
                    customersQ.isLoading ? (
                      <View style={{ paddingVertical: 24 }}>
                        <ActivityIndicator color={theme.primary} />
                      </View>
                    ) : (
                      <Typography
                        variant="body-md"
                        color={theme.inkMuted}
                        style={{ textAlign: 'center', paddingVertical: 24 }}>
                        No customers found
                      </Typography>
                    )
                  }
                  ListFooterComponent={
                    customersQ.isFetchingNextPage ? (
                      <View style={{ paddingVertical: 12 }}>
                        <ActivityIndicator color={theme.inkMuted} />
                      </View>
                    ) : null
                  }
                />

                <View className="px-lg pt-sm">
                  <Button
                    size="lg"
                    fullWidth
                    leftIcon="plus"
                    className="rounded-full"
                    onPress={() => {
                      setNewName(query.trim());
                      setNewPhone('');
                      setError(null);
                      setMode('create');
                    }}>
                    Add new customer
                  </Button>
                </View>
              </>
            ) : (
              <View className="gap-md px-lg">
                <Typography variant="headline-md">New customer</Typography>
                <Input label="Customer name" placeholder="Who's booking?" value={newName} onChangeText={setNewName} autoCapitalize="words" leftIcon="user" />
                <PhoneInput label="Mobile number" value={newPhone} onChangeText={setNewPhone} />
                {error ? (
                  <View className="rounded-2xl px-md py-sm" style={{ backgroundColor: `${theme.danger}14` }}>
                    <Typography variant="body-md" color={theme.danger}>
                      {error}
                    </Typography>
                  </View>
                ) : null}
                <Button size="lg" fullWidth className="rounded-full" rightIcon="check" loading={createCustomer.isPending} onPress={submitCreate}>
                  Use this customer
                </Button>
                <Button
                  variant="tertiary"
                  size="lg"
                  fullWidth
                  className="rounded-full"
                  onPress={() => {
                    setMode('list');
                    setError(null);
                  }}>
                  Back
                </Button>
              </View>
            )}
          </Pressable>
        </Pressable>
      </KeyboardView>
    </Modal>
  );
}
