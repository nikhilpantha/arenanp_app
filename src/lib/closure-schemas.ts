import { yup } from '@/lib/forms';

/** Validates the "block time / close venue" form. */
export const closureSchema = yup.object({
  /** 'court' blocks one court; 'venue' blocks every court. */
  scope: yup.mixed<'court' | 'venue'>().oneOf(['court', 'venue']).required(),
  /** Required only when scope = 'court'. */
  courtId: yup
    .string()
    .default('')
    .when('scope', {
      is: 'court',
      then: (s) => s.required('Pick a court to block'),
      otherwise: (s) => s.optional(),
    }),
  startDate: yup.string().required('Pick a start date'),
  startTime: yup.string().required('Pick a start time'),
  endDate: yup.string().required('Pick an end date'),
  endTime: yup
    .string()
    .required('Pick an end time')
    .test('after-start', 'The block must end after it starts', (endTime, ctx) => {
      const { startDate, startTime, endDate } = ctx.parent as {
        startDate?: string;
        startTime?: string;
        endDate?: string;
      };
      if (!startDate || !startTime || !endDate || !endTime) return true;
      return `${startDate}T${startTime}` < `${endDate}T${endTime}`;
    }),
  reason: yup.string().max(200, 'Keep it short').optional(),
});
