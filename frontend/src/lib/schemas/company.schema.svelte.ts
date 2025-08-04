import * as v from 'valibot'

import { googleMapsFormLocationSchema } from '$lib/utils/google-maps/schema'

export const companyCreateSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  businessNumber: v.pipe(v.string(), v.minLength(1)),
  logoKey: v.optional(v.string()),
  address: v.optional(googleMapsFormLocationSchema),
})

export const companySchema = v.object({
  ...v.omit(companyCreateSchema, ['logoKey']).entries,
  id: v.pipe(v.string(), v.uuid()),
  logoUrl: v.optional(v.string()),
})

export type CompanyCreateData = v.InferOutput<typeof companyCreateSchema>
export type Company = v.InferOutput<typeof companySchema>
