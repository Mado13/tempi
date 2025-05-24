import { InertiaForm } from '@inertiajs/svelte'
import * as v from 'valibot'
import { BaseSchema } from 'valibot'

export const validateForm = (form: InertiaForm<Record<string, any>>, schema: BaseSchema<any, any, any>) => {
  const result = v.safeParse(schema, form.data())

  if (result.success) {
    return true
  } else {
    for (const issue of result.issues) {
      const fieldPath = issue.path?.[0]
      if (fieldPath && typeof fieldPath.key === 'string') {
        const fieldName = fieldPath.key
        if (!form.errors[fieldName]) {
          form.setError(fieldName, issue.message)
        }
      }
    }
  }
}
