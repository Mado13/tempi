import * as v from 'valibot'

export const addressSchema = v.object({
  id: v.string(),
  placeId: v.string(),
  formattedAddress: v.string(),
  city: v.string(),
  country: v.string(),
  district: v.string(),
  latitude: v.number(),
  longitude: v.number(),
  postalCode: v.optional(v.string()),
  streetName: v.string(),
  streetNumber: v.string(),
})

export type Address = v.InferInput<typeof addressSchema>
