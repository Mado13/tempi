import * as v from 'valibot'

// A single address component returned by the Places API
export const AddressComponentSchema = v.object({
  longText: v.string(),
  shortText: v.string(),
  types: v.array(v.string()),
})
export type AddressComponentInput = v.InferInput<typeof AddressComponentSchema>

// Lat/lng pair
export const LocationSchema = v.object({
  lat: v.number(),
  lng: v.number(),
})
export type LocationInput = v.InferInput<typeof LocationSchema>

// Core place fields
export const GoogleMapsPlaceSchema = v.object({
  name: v.string(),
  formattedAddress: v.string(),
  addressComponents: v.array(AddressComponentSchema),
  location: LocationSchema,
})
export type GoogleMapsPlaceInput = v.InferInput<typeof GoogleMapsPlaceSchema>

// Extended with the selected address ID
export const GoogleMapsFormLocationSchema = v.intersect([
  GoogleMapsPlaceSchema,
  v.object({ addressId: v.pipe(v.string(), v.nonEmpty()) }),
])
export type GoogleMapsFormLocationInput = v.InferInput<typeof GoogleMapsFormLocationSchema>

// Alias for backwards compatibility
export type FormLocationInput = GoogleMapsFormLocationInput
