/* eslint-disable simple-import-sort/imports */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Icon, Typography, Badge } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import { useUserStore } from '@/store/userStore';

export const AppHeader: React.FC = () => {
  const name = useUserStore((s) => s.name);
  const avatarUrl = useUserStore((s) => s.avatarUrl);
  const location = useUserStore((s) => s.location);
  const messages = useUserStore((s) => s.messages);
  const notifications = useUserStore((s) => s.notifications);
  const theme = useTheme();

  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadMessages = messages.filter((m) => !m.read).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Avatar fallback={name} src={avatarUrl} size={44} />
          <View className="ml-sm">
            <Typography variant="headline-md">Hey {name} !</Typography>
            <View className="flex-row items-center gap-1.5">
              <Typography variant="label-sm" color={theme.primaryDark}>
                {location}
              </Typography>
              <Icon name="chevronDown" size={16} color={theme.primaryDark} />
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-3.5">
          <View className="relative">
            <Pressable onPress={() => setShowMessages(true)}>
              <Icon name="mail" size={22} color={theme.ink} />
            </Pressable>
            {unreadMessages > 0 ? (
              <View className="absolute -right-1.5 -top-1.5">
                <Badge variant="danger">{String(unreadMessages)}</Badge>
              </View>
            ) : null}
          </View>

          <View className="relative">
            <Pressable onPress={() => setShowNotifications(true)}>
              <Icon name="bell" size={22} color={theme.ink} />
            </Pressable>
            {unreadNotifications > 0 ? (
              <View className="absolute -right-1.5 -top-1.5">
                <Badge variant="danger">{String(unreadNotifications)}</Badge>
              </View>
            ) : null}
          </View>

          <Pressable onPress={() => console.log('Open calendar')} className="p-1">
            <Icon name="calendarDays" size={22} color={theme.ink} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};
