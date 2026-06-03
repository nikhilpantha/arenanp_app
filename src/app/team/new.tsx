import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormScreen, Icon, Input, ScreenHeader, Typography } from '@/components/common';
import { FormInput } from '@/components/form';
import { useTheme } from '@/hooks/use-theme';
import { useYupForm } from '@/lib/forms';
import { type TeamFormValues,teamSchema } from '@/lib/team-schemas';

interface MemberRow {
  name: string;
  phone: string;
}

export default function NewTeamScreen() {
  const theme = useTheme();
  const router = useRouter();

  const form = useYupForm<typeof teamSchema>({ schema: teamSchema, defaultValues: { name: '' } });
  const [members, setMembers] = useState<MemberRow[]>([{ name: '', phone: '' }]);

  const update = (i: number, field: keyof MemberRow, value: string) =>
    setMembers((cur) => cur.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  const add = () => setMembers((cur) => [...cur, { name: '', phone: '' }]);
  const remove = (i: number) => setMembers((cur) => cur.filter((_, idx) => idx !== i));

  const onSubmit = form.handleSubmit((v: TeamFormValues) => {
    if (!members.some((m) => m.name.trim())) {
      Alert.alert('Add players', 'Add at least one player to the team.');
      return;
    }
    // TODO(backend): persist the team + members (tracked for games/loyalty).
    Alert.alert('Team created', v.name, [{ text: 'Done', onPress: () => router.back() }]);
  });

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title="Add team" onBack={() => router.back()} />}
      footer={
        <Button size="lg" fullWidth className="rounded-full" rightIcon="check" onPress={onSubmit}>
          Create team
        </Button>
      }>
      <View className="gap-md pt-md">
        <FormInput
          control={form.control}
          name="name"
          label="Team name"
          placeholder="e.g. Sunday Strikers"
          leftIcon="users"
          autoCapitalize="words"
        />
      </View>

      <View className="gap-sm pt-lg">
        <Typography variant="label-md" color={theme.inkMuted}>
          Players
        </Typography>
        {members.map((m, i) => (
          <View key={i} className="gap-xs">
            <View className="flex-row items-center gap-sm">
              <View className="flex-1">
                <Input
                  value={m.name}
                  onChangeText={(t) => update(i, 'name', t)}
                  placeholder={`Player ${i + 1} name`}
                  leftIcon="user"
                  autoCapitalize="words"
                />
              </View>
              {members.length > 1 ? (
                <Pressable
                  onPress={() => remove(i)}
                  hitSlop={8}
                  accessibilityLabel="Remove player"
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.cardMuted }}>
                  <Icon name="x" size={16} color={theme.inkMuted} />
                </Pressable>
              ) : null}
            </View>
            <Input
              value={m.phone}
              onChangeText={(t) => update(i, 'phone', t)}
              placeholder="Phone (optional)"
              leftIcon="user"
              keyboardType="number-pad"
            />
          </View>
        ))}
        <Button variant="tertiary" size="md" leftIcon="plus" onPress={add}>
          Add player
        </Button>
      </View>
    </FormScreen>
  );
}
