import * as v from 'valibot'

import { googleMapsFormLocationSchema } from '$lib/utils/google-maps/schema'

import { companyCreateSchema } from './company.schema.svelte'
import { requiredNumber } from './global.svelte'

export const jobCreateSchema = v.object({
  companyProfileId: v.pipe(v.string(), v.uuid()),
  numberOfEmployees: v.number(),
  address: googleMapsFormLocationSchema,
  jobClassifications: v.record(v.string(), v.string()),
  date: v.object({
    start: v.pipe(v.string(), v.isoDate()),
    end: v.pipe(v.string(), v.isoDate()),
  }),
  status: v.optional(v.picklist(['open', 'filled', 'finished', 'canceled'])),
  payment: v.object({
    rateType: v.picklist(['daily', 'hourly']),
    rate: v.pipe(
      requiredNumber('A pay rate is required.'),
      v.minValue(0, 'Pay rate must not be negative.'),
    ),
  }),
})

export const jobSchema = v.object({
  ...jobCreateSchema.entries,
  favoritesCount: v.number(),
  company: companyCreateSchema,
})

export type JobCreate = v.InferOutput<typeof jobCreateSchema>
export type JobSchema = v.InferOutput<typeof jobSchema>
