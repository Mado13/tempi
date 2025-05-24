import * as v from 'valibot'

const addressComponentSchema = v.object({
  longText: v.string(),
  shortText: v.string(),
  types: v.array(v.string()),
})

const locationSchema = v.object({
  lat: v.number(),
  lng: v.number(),
})

export const mapsApiSchema = v.object({
  name: v.string(),
  formattedAddress: v.string(),
  addressComponents: v.array(addressComponentSchema),
  location: locationSchema,
})

export const formLocationSchema = v.intersect([
  mapsApiSchema,
  v.object({
    addressId: v.pipe(v.string(), v.nonEmpty()),
  }),
])

export type FormLocationInput = v.InferInput<typeof mapsApiSchema>
