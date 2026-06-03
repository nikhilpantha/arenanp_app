import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Icon, NotificationItem, Screen, ScreenHeader, Typography } from '@/components/common';
import { MOCK_NOTIFICATIONS } from '@/data/notifications';
import { useTheme } from '@/hooks/use-theme';

/**
 * Shared notifications screen — pushed over the tabs from the header bell in both the
 * venue and player areas. Data is mock for now (see MOCK_NOTIFICATIONS).
 */
export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const items = MOCK_NOTIFICATIONS;
  const unread = items.filter((n) => !n.read);
  const earlier = items.filter((n) => n.read);

  return (
    <Screen scroll>
      <View className="pt-sm">
        <ScreenHeader title="Notifications" onBack={() => router.back()} />
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-sm pt-xl">
          <Icon name="bell" size={28} color={theme.inkMuted} />
          <Typography variant="label-lg">You&apos;re all caught up</Typography>
          <Typography variant="body-md" color={theme.inkMuted}>
            New activity will show up here.
          </Typography>
        </View>
      ) : (
        <View className="gap-xl pt-md">
          {unread.length > 0 ? (
            <View>
              <Typography variant="label-sm" color={theme.inkMuted}>
                New
              </Typography>
              {unread.map((n, i) => (
                <NotificationItem key={n.id} {...n} divider={i < unread.length - 1} />
              ))}
            </View>
          ) : null}

          {earlier.length > 0 ? (
            <View>
              <Typography variant="label-sm" color={theme.inkMuted}>
                Earlier
              </Typography>
              {earlier.map((n, i) => (
                <NotificationItem key={n.id} {...n} divider={i < earlier.length - 1} />
              ))}
            </View>
          ) : null}
        </View>
      )}
    </Screen>
  );
}
