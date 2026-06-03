import { yup } from '@/lib/forms';
import type { SportType } from '@/types';

const numberFromInput = (_value: unknown, original: unknown) =>
  original === '' || original == null ? undefined : Number(original);

/** Validates the membership-plan creation form. */
export const membershipPlanSchema = yup.object({
  name: yup.string().required('Plan name is required').min(2, 'Too short'),
  price: yup
    .number()
    .transform(numberFromInput)
    .typeError('Enter a price')
    .required('Enter a price')
    .min(1, 'Enter a price'),
  sports: yup
    .array()
    .of(yup.mixed<SportType>().required())
    .min(1, 'Pick at least one sport')
    .required(),
  openTime: yup.string().required().default('06:00'),
  closeTime: yup.string().required().default('22:00'),
});

export type MembershipPlanFormValues = yup.InferType<typeof membershipPlanSchema>;
