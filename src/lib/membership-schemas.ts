import { yup } from '@/lib/forms';
import type { DayOfWeek, MembershipDuration, SportType } from '@/types';

const numberFromInput = (_value: unknown, original: unknown) =>
  original === '' || original == null ? undefined : Number(original);

const DURATIONS: MembershipDuration[] = [
  'weekly',
  'fortnightly',
  'monthly',
  'quarterly',
  'half-yearly',
  'yearly',
];

/** Selectable session lengths (minutes) a plan can offer. */
export const SESSION_LENGTHS = [30, 60, 90, 120] as const;

/** One allowed subscription band on the plan form. */
export const windowSchema = yup.object({
  start: yup.string().required(),
  end: yup
    .string()
    .required()
    .test('after-start', 'End must be after start', (end, ctx) => {
      const start = (ctx.parent as { start?: string }).start;
      return !start || !end || start < end;
    }),
});

/** Validates the membership-plan creation form. */
export const membershipPlanSchema = yup.object({
  name: yup.string().required('Plan name is required').min(2, 'Too short'),
  price: yup
    .number()
    .transform(numberFromInput)
    .typeError('Enter a price')
    .required('Enter a price')
    .min(1, 'Enter a price'),
  duration: yup
    .mixed<MembershipDuration>()
    .oneOf(DURATIONS, 'Pick a duration')
    .required('Pick a duration'),
  sessionMinutes: yup
    .number()
    .oneOf([...SESSION_LENGTHS], 'Pick a session length')
    .required('Pick a session length'),
  sports: yup
    .array()
    .of(yup.mixed<SportType>().required())
    .min(1, 'Pick at least one sport')
    .required(),
  daysOfWeek: yup
    .array()
    .of(yup.mixed<DayOfWeek>().required())
    .min(1, 'Pick at least one day')
    .required(),
  windows: yup
    .array()
    .of(windowSchema)
    .min(1, 'Add at least one time band')
    .required(),
});

export type MembershipPlanFormValues = yup.InferType<typeof membershipPlanSchema>;

/** Validates the subscribe-a-customer form (a selection form). */
export const subscriptionBookSchema = yup.object({
  customerId: yup.string().required('Choose a customer for this membership.'),
  planId: yup.string().required('Choose a membership plan.'),
  courtId: yup.string().required('Choose a court for the daily session.'),
  startDate: yup.string().required('Choose when the membership starts.'),
  slotStart: yup.string().required('Choose a daily time slot.'),
});

export type SubscriptionBookValues = yup.InferType<typeof subscriptionBookSchema>;
