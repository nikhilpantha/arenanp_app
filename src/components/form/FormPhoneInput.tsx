import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';

import { PhoneInput, type PhoneInputProps } from '@/components/common';

export interface FormPhoneInputProps<TField extends FieldValues>
  extends Omit<PhoneInputProps, 'value' | 'onChangeText' | 'onBlur' | 'error'> {
  control: Control<TField>;
  name: FieldPath<TField>;
}

/**
 * `PhoneInput` wired to React Hook Form. The field stores local digits
 * (e.g. "9801234567"); convert with `toE164` at submit time.
 */
export function FormPhoneInput<TField extends FieldValues>({
  control,
  name,
  ...rest
}: FormPhoneInputProps<TField>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <PhoneInput
      {...rest}
      ref={field.ref}
      value={(field.value as string | undefined) ?? ''}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  );
}
