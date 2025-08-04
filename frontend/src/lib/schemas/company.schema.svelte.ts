import * as v from 'valibot'

import { googleMapsFormLocationSchema } from '$lib/utils/google-maps/schema'

export const companyCreateSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  businessNumber: v.pipe(v.string(), v.minLength(1)),
  logoKey: v.optional(v.string()),
  address: v.optional(googleMapsFormLocationSchema),
})

export type CompanyCreateData = v.InferOutput<typeof companyCreateSchema>
