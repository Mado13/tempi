import { parseDate, today } from '@internationalized/date'
import * as v from 'valibot'

import { m } from '$i18n/paraglide/messages'

import { formLocationSchema } from './api/google_maps'

export const jobFormSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty(m['add_job.job_title.missing']())),
  location: v.optional(formLocationSchema),
  startDate: v.pipe(
    v.string(),
    v.nonEmpty(m['add_job.date.start.missing']()),
    v.custom<string>(input => {
      const date = parseDate(input as string)
      return date.compare(today('UTC')) > 0
    }, m['add_job.date.start.in_past']()),
  ),
  endDate: v.string(),
  pay: v.object({
    rate: v.pipe(v.number(), v.minValue(0, 'Needs translation')),
    type: v.picklist(['hourly', 'daily']),
  }),
  shifts: v.picklist(['morning', 'evening', 'weekend', 'flex']),
  jobClassId: v.pipe(
    v.string(),
    v.transform(Number),
    v.number(),
    v.minValue(1, 'Needs translation'),
  ),
})

export type JobFormData = v.InferInput<typeof jobFormSchema>
