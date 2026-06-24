import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar, HeaderAction, Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

export interface VenueHeaderProps {
  /** Main heading — venue name on the dashboard, page name elsewhere. */
  title: string;
  /** Small eyebrow above the title (e.g. "Welcome back"). */
  eyebrow?: string;
  /** When set, an avatar is shown on the left using this name for the fallback. */
  avatarName?: string;
  /** Resolved (presigned) avatar image URI; falls back to initials when absent. */
  avatarSrc?: string;
  /** When set, the title becomes a tappable venue switcher (shows a chevron). */
  onTitlePress?: () => void;
  /** When set, the avatar becomes a tappable profile/account button. */
  onAvatarPress?: () => void;
}

/**
 * Shared header for every venue tab — keeps the booking calendar + notification
 * actions identical across Dashboard, Bookings, Customers, Finance and Profile.
 */
export function VenueHeader({
  title,
  eyebrow,
  avatarName,
  avatarSrc,
  onTitlePress,
  onAvatarPress,
}: VenueHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  const titleVariant = avatarName ? 'headline-md' : 'headline-lg';

  return (
    <View className="flex-row items-center justify-between pb-lg pt-sm">
      <View className="flex-1 flex-row items-center gap-md">
        {avatarName ? (
          onAvatarPress ? (
            <Pressable onPress={onAvatarPress} accessibilityRole="button" accessibilityLabel="Account">
              <Avatar fallback={avatarName} src={avatarSrc} size={48} />
            </Pressable>
          ) : (
            <Avatar fallback={avatarName} src={avatarSrc} size={48} />
          )
        ) : null}
        <View className="flex-1 gap-[2px]">
          {eyebrow ? (
            <Typography variant="label-sm" color={theme.inkMuted}>
              {eyebrow}
            </Typography>
          ) : null}
          {onTitlePress ? (
            <Pressable
              onPress={onTitlePress}
              accessibilityRole="button"
              accessibilityLabel={`Switch venue. Current: ${title}`}
              className="flex-row items-center gap-xs">
              <Typography variant={titleVariant} numberOfLines={1} style={{ flexShrink: 1 }}>
                {title}
              </Typography>
              <Icon name="chevronDown" size={20} color={theme.ink} />
            </Pressable>
          ) : (
            <Typography variant={titleVariant} numberOfLines={1}>
              {title}
            </Typography>
          )}
        </View>
      </View>

      <View className="flex-row items-center gap-sm">
        <HeaderAction
          icon="calendarDays"
          label="Booking calendar"
          onPress={() => router.push('/venue-calendar')}
        />
        <HeaderAction icon="bell" label="Notifications" showDot onPress={() => router.push('/notifications')} />
      </View>
    </View>
  );
}
