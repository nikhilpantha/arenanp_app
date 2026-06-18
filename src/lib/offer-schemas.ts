import type { ApiOfferDiscountType, ApiOfferTrigger } from '@/lib/api/operations';
import { yup } from '@/lib/forms';

const numberFromInput = (_value: unknown, original: unknown) =>
  original === '' || original == null ? undefined : Number(original);

/**
 * Validates the offer builder against the backend Offer model: a promo-code discount
 * or an every-Nth loyalty reward. Reward/trigger gate their dependent value fields.
 */
export const offerSchema = yup.object({
  title: yup.string().required('Title is required').min(2, 'Too short'),
  description: yup.string().optional(),

  trigger: yup.mixed<ApiOfferTrigger>().required(),
  discountType: yup.mixed<ApiOfferDiscountType>().required(),

  // Value is required for a % / Rs discount, omitted for a free game.
  discountValue: yup
    .number()
    .transform(numberFromInput)
    .when('discountType', {
      is: (d: ApiOfferDiscountType) => d !== 'FREE_GAME',
      then: (s) =>
        s
          .typeError('Enter a value')
          .required('Enter a value')
          .min(1, 'Enter a value')
          .when('discountType', {
            is: (d: ApiOfferDiscountType) => d === 'PERCENT',
            then: (p) => p.max(100, 'Max 100%'),
          }),
      otherwise: (s) => s.optional(),
    }),

  // Optional cap on a percent discount.
  maxDiscount: yup.number().transform(numberFromInput).optional().min(0),

  // A promo code is required for the PROMO_CODE trigger.
  code: yup
    .string()
    .transform((v?: string) => v?.trim().toUpperCase())
    .when('trigger', {
      is: (t: ApiOfferTrigger) => t === 'PROMO_CODE',
      then: (s) => s.required('Enter a code').min(3, 'Too short'),
      otherwise: (s) => s.optional(),
    }),

  // N games is required for the EVERY_NTH (loyalty) trigger.
  everyGames: yup
    .number()
    .transform(numberFromInput)
    .when('trigger', {
      is: (t: ApiOfferTrigger) => t === 'EVERY_NTH',
      then: (s) => s.typeError('Enter a number').required('Enter a number').min(2, 'At least 2'),
      otherwise: (s) => s.optional(),
    }),

  minSubtotal: yup.number().transform(numberFromInput).optional().min(0),
  usageLimit: yup.number().transform(numberFromInput).optional().min(1),
});

export type OfferFormValues = yup.InferType<typeof offerSchema>;
