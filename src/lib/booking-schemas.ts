import { yup } from '@/lib/forms';

/** Validates the customer fields of the new-booking form (selectors are local state). */
export const newBookingSchema = yup.object({
  customerName: yup.string().required('Customer name is required').min(2, 'Too short'),
  phone: yup.string().required('Phone is required').length(10, 'Enter a 10-digit number'),
});

export type NewBookingFormValues = yup.InferType<typeof newBookingSchema>;
