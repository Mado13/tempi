import * as v from 'valibot'

import { googleMapsFormLocationSchema } from '$lib/utils/google-maps/schema'

import { projectPositionCreateSchema } from './project_position.schema.svelte'

export const projectCreateSchema = v.object({
  companyProfileId: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.trim(), v.minLength(1)),
  positions: v.array(projectPositionCreateSchema),
  address: googleMapsFormLocationSchema,
  date: v.object({
    start: v.pipe(v.string(), v.isoDate()),
    end: v.pipe(v.string(), v.isoDate()),
  }),
  notes: v.string(),
  meta: v.optional(v.record(v.string(), v.string())),
})

export const projectSchema = v.object({
  ...v.omit(projectCreateSchema, ['companyProfileId']).entries,
  id: v.pipe(v.string(), v.uuid()),
  status: v.picklist(['published', 'in_progress', 'completed', 'canceled', 'archived']),
  favoritesCount: v.number(),
  companyId: v.pipe(v.string(), v.uuid()),
})

export type PayrojectCreate = v.InferOutput<typeof projectCreateSchema>
export type Project = v.InferOutput<typeof projectSchema>
