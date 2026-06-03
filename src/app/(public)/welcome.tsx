import { View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { Button, Typography } from '@/components/common';
import { Colors, Spacing } from '@/constants/theme';
import { useAuthStore, useRoleStore } from '@/stores';
import type { UserRole } from '@/types';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const choosePendingRole = useAuthStore((s) => s.choosePendingRole);
  const setRole = useRoleStore((s) => s.setRole);

  // Role is chosen by which CTA you tap; set the accent context + stash it for the
  // signup → verify chain, then hand off to the (role-themed) login screen.
  const start = async (role: UserRole) => {
    setRole(role);
    await choosePendingRole(role);
    router.push({ pathname: '/login', params: { role } });
  };

  return (
    <View className="flex-1">
      <SystemBars style="light" />
      <LinearGradient
        // Soft top → brand green base, echoing the reference hero treatment.
        colors={['#d1fae5', '#34d399', Colors.light.primary, Colors.light.primaryDark]}
        locations={[0, 0.45, 0.7, 1]}
        style={{ flex: 1 }}>
        <View
          className="flex-1 justify-between px-lg"
          // Safe-area insets are runtime values, so they stay inline.
          style={{ paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg }}>
          <View className="flex-row items-center gap-sm">
            <View className="h-[18px] w-[18px] rounded-full bg-white" />
            <Typography variant="label-sm" color="rgba(255,255,255,0.9)">
              ArenaNepalSport
            </Typography>
          </View>

          <View className="flex-1 justify-end gap-md pb-xl">
            <Typography variant="display-lg" color="#ffffff">
              All Your{'\n'}Sport In One
            </Typography>
            <Typography
              variant="body-lg"
              color="rgba(255,255,255,0.92)"
              style={{ maxWidth: '90%' }}>
              Book courts, join leagues, and run your venue — everything in a single app.
            </Typography>
          </View>

          <View className="gap-md">
            <Button
              variant="tertiary"
              size="lg"
              fullWidth
              shadow
              className="rounded-full"
              onPress={() => start('player')}>
              Get Started as Player
            </Button>
            <View className="flex-row items-center justify-center">
              <Typography variant="body-md" color="rgba(255,255,255,0.9)">
                Do you have a venue?{' '}
              </Typography>
              <Typography variant="label-lg" color="#ffffff" onPress={() => start('owner')}>
                Continue as owner
              </Typography>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
