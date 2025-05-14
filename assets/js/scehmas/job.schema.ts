import { parseDate, today } from '@internationalized/date'
import * as v from 'valibot'

import { m } from '$paraglide/messages'

import { formLocationSchema } from './api/google_maps'

export const jobFormSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty(m.add_job_title_required())),
  location: v.optional(formLocationSchema),
  startDate: v.pipe(
    v.string(),
    v.nonEmpty(m.add_job_start_date_required()),
    v.custom<string>(input => {
      const date = parseDate(input as string)
      return date.compare(today('UTC')) > 0
    }, m.add_job_start_date_before_today()),
  ),
  endDate: v.string(),
})

export type JobFormData = v.InferInput<typeof jobFormSchema>
