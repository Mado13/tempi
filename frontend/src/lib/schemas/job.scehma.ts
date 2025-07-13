import * as v from 'valibot'

import { GoogleMapsFormLocationSchema } from '$lib/utils/google-maps/schema'

export const jobSchema = v.object({
  id: v.optional(v.string()),
  numberOfEmployees: v.number(),
  address: GoogleMapsFormLocationSchema,
  jobClassification: v.record(v.string(), v.string()),
  date: v.object({
    start: v.pipe(v.string(), v.isoDate()),
    end: v.pipe(v.string(), v.isoDate()),
  }),
  payment: v.object({
    method: v.string(),
    amount: v.string(),
  }),
})

export type Job = v.InferOutput<typeof jobSchema>
