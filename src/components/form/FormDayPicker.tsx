import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/common';
import type { DayOfWeek } from '@/types';

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'sun', label: 'S' },
  { value: 'mon', label: 'M' },
  { value: 'tue', label: 'T' },
  { value: 'wed', label: 'W' },
  { value: 'thu', label: 'T' },
  { value: 'fri', label: 'F' },
  { value: 'sat', label: 'S' },
];

export interface FormDayPickerProps<TField extends FieldValues> {
  control: Control<TField>;
  name: FieldPath<TField>;
}

/** Multi-select day-of-week toggle wired to React Hook Form. Pass `control` + `name`. */
export function FormDayPicker<TField extends FieldValues>({
  control,
  name,
}: FormDayPickerProps<TField>) {
  const { field } = useController({ control, name });
  const value = (field.value as DayOfWeek[] | undefined) ?? [];

  const toggle = (d: DayOfWeek) =>
    field.onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d]);

  return (
    <View className="flex-row gap-xs">
      {DAYS.map((d, i) => {
        const active = value.includes(d.value);
        return (
          <Button
            key={`${d.value}-${i}`}
            variant={active ? 'primary' : 'tertiary'}
            size="md"
            className="flex-1"
            onPress={() => toggle(d.value)}>
            {d.label}
          </Button>
        );
      })}
    </View>
  );
}
