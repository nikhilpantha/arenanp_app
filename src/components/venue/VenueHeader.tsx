import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Avatar, Icon, type IconName, Typography } from '@/components/common';
import { Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface VenueHeaderProps {
  /** Main heading — venue name on the dashboard, page name elsewhere. */
  title: string;
  /** Small eyebrow above the title (e.g. "Welcome back"). */
  eyebrow?: string;
  /** When set, an avatar is shown on the left using this name for the fallback. */
  avatarName?: string;
}

/**
 * Shared header for every venue tab — keeps the booking calendar + notification
 * actions identical across Dashboard, Bookings, Customers, Finance and Profile.
 */
export function VenueHeader({ title, eyebrow, avatarName }: VenueHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between pb-lg pt-sm">
      <View className="flex-1 flex-row items-center gap-md">
        {avatarName ? <Avatar fallback={avatarName} size={48} /> : null}
        <View className="flex-1 gap-[2px]">
          {eyebrow ? (
            <Typography variant="label-sm" color={theme.inkMuted}>
              {eyebrow}
            </Typography>
          ) : null}
          <Typography variant={avatarName ? 'headline-md' : 'headline-lg'} numberOfLines={1}>
            {title}
          </Typography>
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

function HeaderAction({
  icon,
  label,
  onPress,
  showDot,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  showDot?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full"
      style={[{ backgroundColor: theme.card }, Shadow.sm]}>
      <Icon name={icon} size={22} color={theme.ink} />
      {showDot ? (
        <View
          className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: theme.danger, borderWidth: 1.5, borderColor: theme.card }}
        />
      ) : null}
    </Pressable>
  );
}
