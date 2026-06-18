import { Pressable, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { LoginForm } from '@/components/auth';
import {
  Icon,
  type IconName,
  KeyboardAwareScrollView,
  KeyboardView,
  Typography,
} from '@/components/common';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Panel } from '@/types';

// The intro hands us the panel so the hero dresses itself as the player or venue experience.
const ROLE_HERO: Record<
  Panel,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    icon: IconName;
    gradient: readonly [string, string, ...string[]];
  }
> = {
  player: {
    eyebrow: 'Player',
    title: 'Welcome back',
    subtitle: 'Log in to book courts and join the next game.',
    icon: 'trophy',
    gradient: ['#34d399', '#10b981', '#047857'],
  },
  venue: {
    eyebrow: 'Venue',
    title: 'Venue login',
    subtitle: 'Manage your courts, bookings and revenue.',
    icon: 'building',
    gradient: ['#34d399', '#10b981', '#047857'],
  },
};

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { role } = useLocalSearchParams<{ role?: Panel }>();
  const hero = ROLE_HERO[role === 'venue' ? 'venue' : 'player'];
  const bottomGap = Math.max(insets.bottom, Spacing.md);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bg }}>
      {/* Light status-bar icons sit over the colored hero. */}
      <SystemBars style="light" />
      <KeyboardView>
        {/* Scrollable so the CTA stays reachable when the keyboard pushes the form up. */}
        <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          {/* Branded hero — role-tinted gradient that bleeds under the status bar and
              curves into the light form surface below. */}
          <LinearGradient
            colors={hero.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: insets.top + Spacing.sm,
              paddingHorizontal: Spacing.lg,
              paddingBottom: Spacing.xl,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}>
            <View className="flex-row items-center" style={{ minHeight: 44 }}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Icon name="arrowLeft" size={22} color="#ffffff" />
              </Pressable>
            </View>

            <View className="gap-md pt-xl">
              <View
                className="h-16 w-16 items-center justify-center rounded-3xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
                <Icon name={hero.icon} size={30} color="#ffffff" />
              </View>
              <View className="gap-xs">
                <Typography variant="label-sm" color="rgba(255,255,255,0.85)">
                  {hero.eyebrow}
                </Typography>
                <Typography variant="display-lg" color="#ffffff">
                  {hero.title}
                </Typography>
                <Typography variant="body-lg" color="rgba(255,255,255,0.92)">
                  {hero.subtitle}
                </Typography>
              </View>
            </View>
          </LinearGradient>

          {/* Form surface */}
          <View className="flex-1 px-lg pt-xl gap-lg" style={{ paddingBottom: bottomGap }}>
            <LoginForm role={role} />
          </View>
        </KeyboardAwareScrollView>
      </KeyboardView>
    </View>
  );
}
