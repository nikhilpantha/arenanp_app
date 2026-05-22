import { Pressable, View } from 'react-native';

import { Card, Icon, type IconName, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

export interface MenuItem {
  id: string;
  label: string;
  icon: IconName;
  onPress?: () => void;
}

export interface MenuListProps {
  items: readonly MenuItem[];
}

export function MenuList({ items }: MenuListProps) {
  const theme = useTheme();
  return (
    <Card className="p-0">
      {items.map((item, idx) => (
        <Pressable
          key={item.id}
          onPress={item.onPress ?? (() => console.log('[menu]', item.id))}
          className={`flex-row items-center justify-between p-md ${
            idx > 0 ? 'border-t border-border' : ''
          }`}>
          <View className="flex-row items-center gap-md">
            <Icon name={item.icon} size={20} color={theme.ink} />
            <Typography variant="body-md">{item.label}</Typography>
          </View>
          <Icon name="chevron-forward" size={18} color={theme.inkMuted} />
        </Pressable>
      ))}
    </Card>
  );
}
