import { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './Icon';
import { Typography } from './Typography';

export interface TimeSelectProps {
  label?: string;
  value: string; // "HH:MM"
  onChange: (value: string) => void;
}

// 05:00 → 23:30 in 30-min steps.
const TIMES: string[] = (() => {
  const out: string[] = [];
  for (let h = 5; h <= 23; h++) {
    for (const m of [0, 30]) {
      out.push(`${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}`);
    }
  }
  return out;
})();

export function TimeSelect({ label, value, onChange }: TimeSelectProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View className="flex-1 gap-sm">
      {label && (
        <Typography variant="label-md" color={theme.inkMuted}>
          {label}
        </Typography>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        className="h-14 flex-row items-center justify-between rounded-2xl px-md"
        style={{ backgroundColor: theme.cardMuted }}>
        <Typography variant="body-md">{value}</Typography>
        <Icon name="clock" size={18} color={theme.inkMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' }}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.bg,
              borderTopLeftRadius: Radius['3xl'],
              borderTopRightRadius: Radius['3xl'],
              paddingTop: Spacing.lg,
              paddingBottom: Spacing.xl,
              maxHeight: '60%',
            }}>
            <View className="items-center pb-md">
              <Typography variant="label-lg">{label ?? 'Select time'}</Typography>
            </View>
            <FlatList
              data={TIMES}
              keyExtractor={(t) => t}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    className="mx-page my-[2px] flex-row items-center justify-between rounded-2xl px-md py-md"
                    style={{ backgroundColor: selected ? theme.primary : theme.card }}>
                    <Typography variant="body-lg" color={selected ? '#ffffff' : theme.ink}>
                      {item}
                    </Typography>
                    {selected && <Icon name="plus" size={16} color="#ffffff" />}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
