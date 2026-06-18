import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/common';
import { SESSION_LENGTHS } from '@/lib/membership-schemas';
import { sessionLengthLabel } from '@/lib/subscription-format';

export interface FormSessionLengthProps<TField extends FieldValues> {
  control: Control<TField>;
  name: FieldPath<TField>;
}

/** Single-select session-length chips (30 min / 1 hr / …) wired to React Hook Form. */
export function FormSessionLength<TField extends FieldValues>({
  control,
  name,
}: FormSessionLengthProps<TField>) {
  const { field } = useController({ control, name });
  const value = field.value as number | undefined;

  return (
    <View className="flex-row flex-wrap gap-xs">
      {SESSION_LENGTHS.map((minutes) => (
        <Button
          key={minutes}
          variant={value === minutes ? 'primary' : 'tertiary'}
          size="md"
          style={{ width: '23.5%' }}
          onPress={() => field.onChange(minutes)}>
          {sessionLengthLabel(minutes)}
        </Button>
      ))}
    </View>
  );
}
