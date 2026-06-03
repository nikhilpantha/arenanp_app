import { yup } from '@/lib/forms';

export const teamSchema = yup.object({
  name: yup.string().required('Team name is required').min(2, 'Too short'),
});

export type TeamFormValues = yup.InferType<typeof teamSchema>;
