import * as v from 'valibot'

// Lat/lng pair
export const LocationSchema = v.object({
  lat: v.number(),
  lng: v.number(),
})
export type LocationInput = v.InferInput<typeof LocationSchema>

// Simplified place data for job matching
export const GoogleMapsFormLocationSchema = v.object({
  name: v.string(),
  formattedAddress: v.string(),
  locality: v.optional(v.string()),
  district: v.optional(v.string()),
  location: LocationSchema,
  googlePlaceId: v.pipe(v.string(), v.nonEmpty()),
})

export type FormLocationInput = v.InferInput<typeof GoogleMapsFormLocationSchema>

// Keep these if you need them elsewhere, but remove from main schema
export const AddressComponentSchema = v.object({
  longText: v.string(),
  shortText: v.string(),
  types: v.array(v.string()),
})
export type AddressComponentInput = v.InferInput<typeof AddressComponentSchema>
