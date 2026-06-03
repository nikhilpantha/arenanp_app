import {
  type DefaultValues,
  type FieldValues,
  type Resolver,
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export { yup };

export interface UseYupFormArgs<TSchema extends yup.AnyObjectSchema> extends Omit<
  UseFormProps<yup.InferType<TSchema>>,
  'resolver' | 'defaultValues'
> {
  schema: TSchema;
  defaultValues?: DefaultValues<yup.InferType<TSchema>>;
}

export function useYupForm<TSchema extends yup.AnyObjectSchema>({
  schema,
  defaultValues,
  ...rest
}: UseYupFormArgs<TSchema>): UseFormReturn<yup.InferType<TSchema>> {
  type Values = yup.InferType<TSchema> & FieldValues;
  return useForm<Values>({
    resolver: yupResolver(schema) as Resolver<Values>,
    defaultValues,
    mode: 'onTouched',
    ...rest,
  });
}
