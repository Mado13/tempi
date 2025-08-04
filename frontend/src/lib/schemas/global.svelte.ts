import * as v from 'valibot'

/**
 * Creates a reusable base schema for required number fields that should appear
 * empty by default in a form.
 */
export function requiredNumber(requiredMessage = 'This field is required.') {
  // This function now returns the base pipeline directly
  return v.pipe(
    v.union([v.string(), v.number(), v.null_(), v.undefined()]),
    v.transform((val) => (val === '' || val === null || val === undefined ? NaN : Number(val))),
    v.number(requiredMessage),
  )
}

export const requiredString = (requiredMessage = 'This field is required') =>
  v.pipe(v.string(), v.trim(), v.minLength(1, requiredMessage))
