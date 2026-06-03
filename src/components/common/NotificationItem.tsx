import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

export type NotificationItemTone = 'success' | 'warning' | 'info' | 'neutral';

export interface NotificationItemProps {
  icon: IconName;
  title: string;
  body: string;
  time: string;
  tone?: NotificationItemTone;
  /** Unread items show a bold title + accent dot. */
  read?: boolean;
  /** Draws a bottom hairline (for stacking in a list). */
  divider?: boolean;
  onPress?: () => void;
}

/**
 * A single notification row — tone-colored icon, title/body, timestamp and an unread dot.
 * Role-agnostic, so the same component backs the venue and player notification screens.
 */
export function NotificationItem({
  icon,
  title,
  body,
  time,
  tone = 'neutral',
  read = false,
  divider = false,
  onPress,
}: NotificationItemProps) {
  const theme = useTheme();
  const toneColor = {
    success: theme.primary,
    warning: theme.secondaryDark,
    info: '#2563eb',
    neutral: theme.inkMuted,
  }[tone];

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-md py-md"
      style={({ pressed }) => [
        { opacity: pressed && onPress ? 0.92 : 1 },
        divider ? { borderBottomWidth: 1, borderColor: theme.border } : null,
      ]}>
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: `${toneColor}1A` }}>
        <Icon name={icon} size={20} color={toneColor} />
      </View>
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-md" color={read ? theme.inkMuted : theme.ink}>
          {title}
        </Typography>
        <Typography variant="body-md" color={theme.inkMuted} numberOfLines={2}>
          {body}
        </Typography>
      </View>
      <View className="items-end gap-xs">
        <Typography variant="label-sm" color={theme.inkMuted} style={{ textTransform: 'none' }}>
          {time}
        </Typography>
        {!read ? (
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.primary }} />
        ) : null}
      </View>
    </Pressable>
  );
}
