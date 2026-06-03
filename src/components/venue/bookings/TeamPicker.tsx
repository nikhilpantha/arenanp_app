import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Icon, SearchBar, Typography } from '@/components/common';
import { TEAMS } from '@/data/teams';
import { useTheme } from '@/hooks/use-theme';
import type { Team } from '@/types';

/**
 * Bottom slide-up sheet to pick a team: search existing teams, tap to select, or
 * "Add new team" at the bottom (opens the add-team screen).
 */
export function TeamPicker({
  visible,
  onClose,
  onSelect,
  onAddTeam,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (team: Team) => void;
  onAddTeam: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const teams = q ? TEAMS.filter((t) => t.name.toLowerCase().includes(q)) : TEAMS;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onClose}>
        <Pressable
          // Stop taps inside the sheet from closing it.
          onPress={() => {}}
          className="rounded-t-3xl"
          style={{ backgroundColor: theme.bg, maxHeight: '82%', paddingBottom: insets.bottom + 16 }}>
          <View className="items-center pb-md pt-sm">
            <View className="h-1 w-10 rounded-full" style={{ backgroundColor: theme.cardSunken }} />
          </View>

          <View className="gap-md px-lg">
            <Typography variant="headline-md">Select team</Typography>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onClear={() => setQuery('')}
              placeholder="Search teams"
            />
          </View>

          <ScrollView
            className="px-lg"
            contentContainerStyle={{ paddingVertical: 12, gap: 8 }}
            keyboardShouldPersistTaps="handled">
            {teams.length === 0 ? (
              <Typography
                variant="body-md"
                color={theme.inkMuted}
                style={{ textAlign: 'center', paddingVertical: 24 }}>
                No teams found
              </Typography>
            ) : (
              teams.map((t) => (
                <Card
                  key={t.id}
                  elevation="sm"
                  onPress={() => {
                    onSelect(t);
                    onClose();
                  }}
                  className="flex-row items-center gap-md">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: theme.cardMuted }}>
                    <Icon name="users" size={20} color={theme.primary} />
                  </View>
                  <View className="flex-1">
                    <Typography variant="label-lg">{t.name}</Typography>
                    <Typography variant="body-md" color={theme.inkMuted}>
                      {t.members.length} members · {t.totalGames} games
                    </Typography>
                  </View>
                  <Icon name="chevronRight" size={20} color={theme.inkMuted} />
                </Card>
              ))
            )}
          </ScrollView>

          <View className="px-lg pt-sm">
            <Button
              size="lg"
              fullWidth
              leftIcon="plus"
              className="rounded-full"
              onPress={() => {
                onClose();
                onAddTeam();
              }}>
              Add new team
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
