import * as v from 'valibot'

import { requiredNumber, requiredString } from './global.svelte'

export const projectPositionCreateSchema = v.object({
  numberOfEmployees: v.number(),
  jobClassification: v.record(v.string(), v.string()),
  payment: v.object({
    rateType: v.picklist(['daily', 'hourly']),
    rate: v.pipe(
      requiredNumber('A pay rate is required.'),
      v.minValue(0, 'Pay rate must not be negative.'),
    ),
  }),
  notes: v.optional(v.string()),
})

export const projectPositionSchema = v.object({
  ...projectPositionCreateSchema.entries,
  title: v.string(),
  id: v.pipe(v.string(), v.uuid()),
  projectId: v.pipe(v.string(), v.uuid()),
  favoritesCount: v.number(),
  applicationsCount: v.number(),
})

export type ProjectPositionCreate = v.InferOutput<typeof projectPositionCreateSchema>
export type ProjectPosition = v.InferOutput<typeof projectPositionSchema>
