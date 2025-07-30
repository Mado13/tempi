import * as v from 'valibot'

export const minCompanyCreateSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  businessNumber: v.pipe(v.string(), v.minLength(1)),
})

export const fullCompanyCreateSchema = v.object({
  ...minCompanyCreateSchema.entries,
})

export type MinCompanyCreateData = v.InferOutput<typeof minCompanyCreateSchema>
export type FullCompanyCreateData = v.InferOutput<typeof fullCompanyCreateSchema>
