import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, FormScreen, Icon, ScreenHeader, Typography } from '@/components/common';
import { TeamPicker } from '@/components/venue/bookings/TeamPicker';
import { DURATION_LABEL, MEMBERSHIP_TIERS } from '@/data/memberships';
import { useTheme } from '@/hooks/use-theme';
import type { Team } from '@/types';

/**
 * Team-first monthly membership booking: pick (or add) a team, choose a plan, confirm.
 * TODO(backend): persist the membership + first payment.
 */
export default function BookMembershipScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tierId, setTierId] = useState<string | null>(null);

  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId) ?? null;
  const totalLabel = tier ? `Rs ${tier.price}` : '—';

  const onConfirm = () => {
    if (!team) return Alert.alert('Select a team', 'Choose or add a team for this membership.');
    if (!tier) return Alert.alert('Pick a plan', 'Choose a membership plan.');
    Alert.alert('Membership booked', `${team.name} · ${tier.name} · ${totalLabel}/${DURATION_LABEL[tier.duration]}`, [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  return (
    <FormScreen
      scroll
      header={<ScreenHeader title="New membership" onBack={() => router.back()} />}
      footer={
        <Button size="lg" fullWidth className="rounded-full" rightIcon="check" onPress={onConfirm}>
          {`Confirm · ${totalLabel}`}
        </Button>
      }>
      {/* Team */}
      <View className="gap-sm pt-md">
        <Typography variant="label-md" color={theme.inkMuted}>
          Team
        </Typography>
        {team ? (
          <Card elevation="sm" className="flex-row items-center gap-md">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: theme.cardMuted }}>
              <Icon name="users" size={22} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Typography variant="label-lg">{team.name}</Typography>
              <Typography variant="body-md" color={theme.inkMuted}>
                {team.members.length} members · {team.totalGames} games
              </Typography>
            </View>
            <Pressable onPress={() => setPickerVisible(true)} hitSlop={8}>
              <Typography variant="label-md" color={theme.primary}>
                Change
              </Typography>
            </Pressable>
          </Card>
        ) : (
          <Pressable
            onPress={() => setPickerVisible(true)}
            className="items-center justify-center gap-sm rounded-3xl border-2 border-dashed py-xl"
            style={{ borderColor: theme.primary, backgroundColor: `${theme.primary}0D` }}>
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: `${theme.primary}1A` }}>
              <Icon name="users" size={26} color={theme.primary} />
            </View>
            <Typography variant="label-lg" color={theme.primary}>
              Select team
            </Typography>
            <Typography variant="body-md" color={theme.inkMuted}>
              Search an existing team or add a new one
            </Typography>
          </Pressable>
        )}
      </View>

      {/* Plan */}
      <View className="gap-sm pt-lg">
        <Typography variant="label-md" color={theme.inkMuted}>
          Plan
        </Typography>
        {MEMBERSHIP_TIERS.map((t) => {
          const active = t.id === tierId;
          return (
            <Card
              key={t.id}
              elevation={active ? 'md' : 'sm'}
              onPress={() => setTierId(t.id)}
              style={active ? { borderWidth: 1.5, borderColor: theme.primary } : undefined}
              className="flex-row items-center gap-md">
              <View className="flex-1">
                <Typography variant="label-lg">{t.name}</Typography>
                <Typography variant="body-md" color={theme.inkMuted}>
                  Rs {t.price} / {DURATION_LABEL[t.duration]} · {t.sportsIncluded.length} sports
                </Typography>
              </View>
              {active ? <Icon name="check" size={20} color={theme.primary} /> : null}
            </Card>
          );
        })}
      </View>

      <TeamPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={setTeam}
        onAddTeam={() => router.push('/team/new')}
      />
    </FormScreen>
  );
}
