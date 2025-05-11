import * as v from 'valibot'
import { parseDate, today } from '@internationalized/date'
import { m } from '$paraglide/messages'

export const jobFormSchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty(m.add_job_title_required())),
  location: v.pipe(v.string(), v.nonEmpty(m.add_job_location_required())),
  jobStart: v.pipe(
    v.string(),
    v.nonEmpty(m.add_job_start_date_required()),
    v.custom<string>(input => {
      const date = parseDate(input as string)
      return date.compare(today('UTC')) > 0
    }, m.add_job_start_date_before_today()),
  ),
  jobEnd: v.string(),
})

export type JobFormData = v.InferInput<typeof jobFormSchema>
