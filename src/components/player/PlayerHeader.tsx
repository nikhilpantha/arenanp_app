import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar, HeaderAction, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { useDisplayUri } from '@/lib/api/uploads';
import { useAuthStore } from '@/stores';

export interface PlayerHeaderProps {
  /** Small eyebrow above the greeting (default "Welcome back"). */
  eyebrow?: string;
  /**
   * When set, the header shows this title instead of the "Hey {name} 👋" greeting.
   * Use it on non-home tabs (e.g. "Venues"); the home screen keeps the default greeting.
   */
  title?: string;
  /** Tap handler for the avatar (defaults to opening the Profile tab). */
  onAvatarPress?: () => void;
}

/**
 * Shared header for every player tab — the avatar on the left and the schedule +
 * notification actions on the right, mirroring the venue header. The home screen shows a
 * "Hey {name} 👋" greeting; other tabs pass a `title` to show the tab name instead.
 */
export function PlayerHeader({ eyebrow = 'Welcome back', title, onAvatarPress }: PlayerHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const fullName = profile?.fullName ?? 'Player';
  const firstName = fullName.split(' ')[0];
  const avatarUri = useDisplayUri(profile?.avatarUrl);

  return (
    <View className="flex-row items-center justify-between pb-lg pt-sm">
      <View className="flex-1 flex-row items-center gap-md">
        <Pressable
          onPress={onAvatarPress ?? (() => router.push('/profile'))}
          accessibilityRole="button"
          accessibilityLabel="Account">
          <Avatar fallback={fullName} src={avatarUri} size={48} />
        </Pressable>
        {title ? (
          <Typography variant="headline-md" numberOfLines={1} style={{ flex: 1 }}>
            {title}
          </Typography>
        ) : (
          <View className="flex-1 gap-[2px]">
            <Typography variant="label-sm" color={theme.inkMuted}>
              {eyebrow}
            </Typography>
            <Typography variant="headline-md" numberOfLines={1}>
              Hey {firstName} 👋
            </Typography>
          </View>
        )}
      </View>

      <View className="flex-row items-center gap-sm">
        <HeaderAction
          icon="calendarDays"
          label="My schedule"
          onPress={() => router.push('/player-calendar')}
        />
        <HeaderAction
          icon="bell"
          label="Notifications"
          showDot
          onPress={() => router.push('/notifications')}
        />
      </View>
    </View>
  );
}
