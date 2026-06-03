import { yup } from '@/lib/forms';
import type { SportType } from '@/types';

/** Player onboarding: at least one sport of interest (editable later from profile). */
export const playerSportsSchema = yup.object({
  sports: yup
    .array()
    .of(yup.mixed<SportType>().required())
    .min(1, 'Pick at least one sport')
    .required(),
});

export type PlayerSportsFormValues = yup.InferType<typeof playerSportsSchema>;
