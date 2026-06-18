import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Button, Icon, Typography } from '@/components/common';
import { ModalBackdrop } from '@/components/common/ModalBackdrop';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

/** Bottom-sheet holding every member filter (status + plan) in one place. */
export function MembersFilterSheet<S extends string, P extends string>({
  visible,
  onClose,
  onReset,
  statusOptions,
  status,
  onStatusChange,
  planOptions,
  planId,
  onPlanChange,
}: {
  visible: boolean;
  onClose: () => void;
  onReset: () => void;
  statusOptions: readonly ChipOption<S>[];
  status: S;
  onStatusChange: (value: S) => void;
  planOptions: readonly ChipOption<P>[];
  planId: P;
  onPlanChange: (value: P) => void;
}) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <ModalBackdrop onPress={onClose} />
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.bg,
            borderTopLeftRadius: Radius['3xl'],
            borderTopRightRadius: Radius['3xl'],
            paddingTop: Spacing.lg,
            paddingBottom: Spacing.xl,
            maxHeight: '75%',
          }}>
          <View className="flex-row items-center justify-between px-page pb-md">
            <Typography variant="headline-sm">Filters</Typography>
            <Pressable onPress={onReset} hitSlop={8}>
              <Typography variant="label-md" color={theme.primary}>
                Reset
              </Typography>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="px-page">
            <Section title="Status">
              {statusOptions.map((o) => (
                <Chip
                  key={o.value}
                  label={o.label}
                  selected={o.value === status}
                  onPress={() => onStatusChange(o.value)}
                  theme={theme}
                />
              ))}
            </Section>

            <Section title="Membership plan">
              {planOptions.map((o) => (
                <Chip
                  key={o.value}
                  label={o.label}
                  selected={o.value === planId}
                  onPress={() => onPlanChange(o.value)}
                  theme={theme}
                />
              ))}
            </Section>
          </ScrollView>

          <View className="px-page pt-md">
            <Button size="lg" fullWidth className="rounded-full" onPress={onClose}>
              Show results
            </Button>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View className="gap-sm pb-lg">
      <Typography variant="label-md" color={theme.inkMuted}>
        {title}
      </Typography>
      <View className="flex-row flex-wrap gap-sm">{children}</View>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-xs rounded-full px-md py-sm"
      style={[
        {
          backgroundColor: selected ? theme.primary : theme.card,
          borderWidth: 1,
          borderColor: selected ? theme.primary : theme.border,
        },
        selected ? null : Shadow.sm,
      ]}>
      {selected ? <Icon name="check" size={14} color="#ffffff" /> : null}
      <Typography variant="label-sm" color={selected ? '#ffffff' : theme.ink} style={{ textTransform: 'none' }}>
        {label}
      </Typography>
    </Pressable>
  );
}
