import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/common';
import { MEMBERSHIP_DURATIONS } from '@/data/memberships';
import type { MembershipDuration } from '@/types';

export interface FormDurationChipsProps<TField extends FieldValues> {
  control: Control<TField>;
  name: FieldPath<TField>;
}

/** Single-select membership-duration chip grid wired to React Hook Form. */
export function FormDurationChips<TField extends FieldValues>({
  control,
  name,
}: FormDurationChipsProps<TField>) {
  const { field } = useController({ control, name });
  const value = field.value as MembershipDuration | undefined;

  return (
    <View className="flex-row flex-wrap gap-xs">
      {MEMBERSHIP_DURATIONS.map((d) => (
        <Button
          key={d.value}
          variant={value === d.value ? 'primary' : 'tertiary'}
          size="md"
          style={{ width: '31.5%' }}
          onPress={() => field.onChange(d.value)}>
          {d.label}
        </Button>
      ))}
    </View>
  );
}
