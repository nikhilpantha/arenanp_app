import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';

import { OtpInput, type OtpInputProps } from '@/components/common';

export interface FormOtpInputProps<TField extends FieldValues>
  extends Omit<OtpInputProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<TField>;
  name: FieldPath<TField>;
}

/**
 * `OtpInput` wired to React Hook Form. Pass `control` + `name`; `onComplete`
 * still fires once every digit is entered (use it to auto-submit).
 */
export function FormOtpInput<TField extends FieldValues>({
  control,
  name,
  ...rest
}: FormOtpInputProps<TField>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <OtpInput
      {...rest}
      value={(field.value as string | undefined) ?? ''}
      onChangeText={field.onChange}
      error={!!fieldState.error}
    />
  );
}
