import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { Button, Icon, TimeSelect, Typography } from '@/components/common';
import { useTheme } from '@/hooks/use-theme';
import type { TimeWindow } from '@/lib/api/subscriptions';

export interface FormWindowsEditorProps<TField extends FieldValues> {
  control: Control<TField>;
  name: FieldPath<TField>;
}

/**
 * Editor for a plan's allowed subscription bands (a list of From–To windows), wired
 * to React Hook Form. Owners add the time ranges they're willing to give to
 * subscriptions; everything else stays open for normal bookings.
 */
export function FormWindowsEditor<TField extends FieldValues>({
  control,
  name,
}: FormWindowsEditorProps<TField>) {
  const theme = useTheme();
  const { field } = useController({ control, name });
  const windows = (field.value as TimeWindow[] | undefined) ?? [];

  const update = (i: number, patch: Partial<TimeWindow>) =>
    field.onChange(windows.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));
  const add = () => field.onChange([...windows, { start: '06:00', end: '08:00' }]);
  const remove = (i: number) => field.onChange(windows.filter((_, idx) => idx !== i));

  return (
    <View className="gap-sm">
      {windows.map((w, i) => (
        <View key={i} className="flex-row items-end gap-sm">
          <TimeSelect value={w.start} onChange={(start) => update(i, { start })} />
          <Typography variant="body-md" color={theme.inkMuted} style={{ paddingBottom: 16 }}>
            –
          </Typography>
          <TimeSelect value={w.end} onChange={(end) => update(i, { end })} />
          <Pressable
            onPress={() => remove(i)}
            hitSlop={8}
            className="h-14 w-10 items-center justify-center"
            accessibilityLabel="Remove band">
            <Icon name="x" size={20} color={theme.danger} />
          </Pressable>
        </View>
      ))}
      <Button variant="tertiary" size="md" leftIcon="plus" className="rounded-full" onPress={add}>
        Add time band
      </Button>
    </View>
  );
}
