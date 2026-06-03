import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';

import { SportChips } from '@/components/onboarding/SportChips';
import type { SportType } from '@/types';

export interface FormSportChipsProps<TField extends FieldValues> {
  control: Control<TField>;
  name: FieldPath<TField>;
}

/** `SportChips` wired to React Hook Form. Pass `control` + `name`. */
export function FormSportChips<TField extends FieldValues>({
  control,
  name,
}: FormSportChipsProps<TField>) {
  const { field } = useController({ control, name });

  return (
    <SportChips
      value={(field.value as SportType[] | undefined) ?? []}
      onChange={field.onChange}
    />
  );
}
