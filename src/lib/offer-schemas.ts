import { yup } from '@/lib/forms';
import type { OfferRewardKind, OfferTriggerKind, SportType } from '@/types';

const numberFromInput = (_value: unknown, original: unknown) =>
  original === '' || original == null ? undefined : Number(original);

/** Validates the offer builder. Reward/trigger kinds gate their value fields. */
export const offerSchema = yup.object({
  title: yup.string().required('Title is required').min(2, 'Too short'),
  reward: yup.mixed<OfferRewardKind>().required(),
  // Required only when the reward carries a value (percent / flat).
  rewardValue: yup
    .number()
    .transform(numberFromInput)
    .when('reward', {
      is: (r: OfferRewardKind) => r !== 'free-game',
      then: (s) => s.typeError('Enter a value').required('Enter a value').min(1, 'Enter a value'),
      otherwise: (s) => s.optional(),
    }),
  trigger: yup.mixed<OfferTriggerKind>().required(),
  // Required only for the "every Nth game" trigger.
  everyGames: yup
    .number()
    .transform(numberFromInput)
    .when('trigger', {
      is: (t: OfferTriggerKind) => t === 'every-nth',
      then: (s) => s.typeError('Enter a number').required('Enter a number').min(2, 'At least 2'),
      otherwise: (s) => s.optional(),
    }),
  startTime: yup.string().required().default('06:00'),
  closeTime: yup.string().required().default('10:00'),
  sports: yup.array().of(yup.mixed<SportType>().required()).default([]),
});

export type OfferFormValues = yup.InferType<typeof offerSchema>;
