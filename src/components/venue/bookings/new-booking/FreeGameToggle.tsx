import { Pressable, View } from 'react-native';

import { Icon, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';

/** Toggle to redeem the customer's earned loyalty free game (booking becomes free). */
export function FreeGameToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      className="mt-lg flex-row items-center gap-md rounded-2xl border p-md"
      style={{
        borderColor: active ? theme.primary : theme.border,
        backgroundColor: active ? `${theme.primary}0D` : theme.card,
      }}>
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${theme.primary}1A` }}>
        <Icon name="award" size={20} color={theme.primary} />
      </View>
      <View className="flex-1 gap-[2px]">
        <Typography variant="label-md">Apply free game</Typography>
        <Typography variant="body-md" color={theme.inkMuted}>
          Loyalty reward earned — this booking is on the house.
        </Typography>
      </View>
      <View
        className="h-6 w-6 items-center justify-center rounded-full"
        style={{
          borderWidth: 2,
          borderColor: active ? theme.primary : theme.border,
          backgroundColor: active ? theme.primary : 'transparent',
        }}>
        {active ? <Icon name="check" size={14} color="#ffffff" /> : null}
      </View>
    </Pressable>
  );
}
