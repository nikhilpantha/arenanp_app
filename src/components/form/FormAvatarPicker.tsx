import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';

import { AvatarPicker, type AvatarPickerProps } from '@/components/common';

export interface FormAvatarPickerProps<TField extends FieldValues>
  extends Omit<AvatarPickerProps, 'value' | 'onChange'> {
  control: Control<TField>;
  name: FieldPath<TField>;
}

/**
 * `AvatarPicker` wired to React Hook Form. Pass `control` + `name`; the picked image
 * URI is written back to the form value.
 */
export function FormAvatarPicker<TField extends FieldValues>({
  control,
  name,
  ...rest
}: FormAvatarPickerProps<TField>) {
  const { field } = useController({ control, name });

  return (
    <AvatarPicker
      {...rest}
      value={(field.value as string | undefined) ?? ''}
      onChange={field.onChange}
    />
  );
}
