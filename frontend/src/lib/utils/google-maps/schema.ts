import * as v from 'valibot'

// Lat/lng pair
export const locationSchema = v.object({
  lat: v.number(),
  lng: v.number(),
})
export type LocationInput = v.InferInput<typeof locationSchema>

// Simplified place data for job matching
export const googleMapsFormLocationSchema = v.object({
  name: v.string(),
  formattedAddress: v.string(),
  locality: v.optional(v.string()),
  district: v.optional(v.string()),
  location: locationSchema,
  googlePlaceId: v.pipe(v.string(), v.nonEmpty()),
})

export type FormLocationInput = v.InferInput<typeof googleMapsFormLocationSchema>

export const addressComponentSchema = v.object({
  longText: v.string(),
  shortText: v.string(),
  types: v.array(v.string()),
})
export type AddressComponentInput = v.InferInput<typeof addressComponentSchema>
