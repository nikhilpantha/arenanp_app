import { Pressable, View } from 'react-native';

import { Card, Icon, SectionHeader, Typography } from '@/components/common';
import type { ProfileRowItem } from '@/data/venue-profile';
import { useTheme } from '@/hooks/use-theme';

/** A titled card of tappable settings rows (Manage venue / Account & settings). */
export function ProfileSection({
  title,
  rows,
  onRowPress,
}: {
  title: string;
  rows: ProfileRowItem[];
  onRowPress?: (row: ProfileRowItem) => void;
}) {
  return (
    <View className="gap-sm pt-xl">
      <SectionHeader title={title} />
      <Card elevation="sm">
        {rows.map((row, i) => (
          <ProfileRow key={row.key} row={row} divider={i < rows.length - 1} onPress={() => onRowPress?.(row)} />
        ))}
      </Card>
    </View>
  );
}

function ProfileRow({ row, divider, onPress }: { row: ProfileRowItem; divider: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-md py-md"
      style={({ pressed }) => [
        { opacity: pressed ? 0.92 : 1 },
        divider ? { borderBottomWidth: 1, borderColor: theme.border } : null,
      ]}>
      <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: theme.cardMuted }}>
        <Icon name={row.icon} size={20} color={theme.primary} />
      </View>
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-md">{row.title}</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          {row.subtitle}
        </Typography>
      </View>
      <Icon name="chevronRight" size={20} color={theme.inkMuted} />
    </Pressable>
  );
}
