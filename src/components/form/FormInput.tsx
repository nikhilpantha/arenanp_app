import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';

import { Input, type InputProps } from '@/components/common';

export interface FormInputProps<TField extends FieldValues>
  extends Omit<InputProps, 'value' | 'onChangeText' | 'onBlur' | 'error'> {
  control: Control<TField>;
  name: FieldPath<TField>;
}

/**
 * `Input` wired to React Hook Form. Pass `control` + `name`; value, onChange,
 * onBlur, and the error message are handled for you.
 */
export function FormInput<TField extends FieldValues>({
  control,
  name,
  ...rest
}: FormInputProps<TField>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <Input
      {...rest}
      value={(field.value as string | undefined) ?? ''}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
