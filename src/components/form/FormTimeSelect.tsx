import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';

import { TimeSelect, type TimeSelectProps } from '@/components/common';

export interface FormTimeSelectProps<TField extends FieldValues>
  extends Omit<TimeSelectProps, 'value' | 'onChange'> {
  control: Control<TField>;
  name: FieldPath<TField>;
}

/** `TimeSelect` ("HH:MM") wired to React Hook Form. Pass `control` + `name`. */
export function FormTimeSelect<TField extends FieldValues>({
  control,
  name,
  ...rest
}: FormTimeSelectProps<TField>) {
  const { field } = useController({ control, name });

  return (
    <TimeSelect
      {...rest}
      value={(field.value as string | undefined) ?? ''}
      onChange={field.onChange}
    />
  );
}
