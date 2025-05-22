import * as v from 'valibot'

export const jobResponseSchema = v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  start_date: v.string(),
  end_date: v.string(),
  pay_rate: v.optional(v.string()),
})
