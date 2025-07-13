// src/lib/forms.svelte.ts - Optimized version
import type { GenericSchema, InferOutput } from 'valibot'
import { safeParse } from 'valibot'

import { m } from '$lib/i18n/messages'

import { type ApiResult, api } from './api'

interface FormConfig<TSchema extends GenericSchema> {
  schema: TSchema
  defaultValues?: Partial<InferOutput<TSchema>>
  onSubmit?: (values: InferOutput<TSchema>) => Promise<void> | void
  validateOn?: 'change' | 'blur' | 'submit'
}

// Simplified state type
interface FormState {
  [key: string]: any
  _meta: {
    errors: Record<string, string[]>
    touched: Record<string, boolean>
    isSubmitting: boolean
    isValidating: boolean
    lastResult: ApiResult | null
  }
}

type FormErrors<T> = {
  [K in keyof T]?: string
} & {
  _all?: string[]
}

// Cleaner form instance type
type FormInstance<TSchema extends GenericSchema> = InferOutput<TSchema> & {
  errors: FormErrors<InferOutput<TSchema>>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValidating: boolean
  isDirty: boolean
  isValid: boolean
  hasErrors: boolean
  lastResult: ApiResult | null

  // Core methods
  validate: (fieldName?: string) => Promise<boolean>
  handleSubmit: (e: Event) => Promise<void>
  handleBlur: (fieldName: string) => void
  reset: () => void
  setErrors: (errors: Record<string, string | string[]>) => void
  clearErrors: (field?: string) => void
  setValue: (name: string, value: any) => void

  // HTTP methods - now just wrappers around api module
  post: <T = any>(path: string, options?: any) => Promise<ApiResult<T>>
  put: <T = any>(path: string, options?: any) => Promise<ApiResult<T>>
  patch: <T = any>(path: string, options?: any) => Promise<ApiResult<T>>
  delete: <T = any>(path: string, options?: any) => Promise<ApiResult<T>>
  get: <T = any>(path: string, options?: any) => Promise<ApiResult<T>>
}

export function createForm<TSchema extends GenericSchema>(
  config: FormConfig<TSchema>,
): FormInstance<TSchema> {
  type FormData = InferOutput<TSchema>

  const { schema, defaultValues = {} as Partial<FormData>, onSubmit, validateOn = 'blur' } = config
  const initialValues = { ...defaultValues } as Record<string, any>

  // Simplified state management
  const state = $state<FormState>({
    ...defaultValues,
    _meta: {
      errors: {},
      touched: {},
      isSubmitting: false,
      isValidating: false,
      lastResult: null,
    },
  })

  // More efficient validation
  async function validate(fieldName?: string): Promise<boolean> {
    state._meta.isValidating = true

    try {
      // Extract form values (exclude _meta)
      const values = Object.fromEntries(Object.entries(state).filter(([key]) => key !== '_meta'))

      const result = safeParse(schema, values)

      if (result.success) {
        if (fieldName) {
          delete state._meta.errors[fieldName]
        } else {
          state._meta.errors = {}
        }
        return true
      }

      // Process validation errors
      const newErrors: Record<string, string[]> = {}
      if (result.issues) {
        for (const issue of result.issues) {
          const path = Array.isArray(issue.path)
            ? issue.path
                .map((p) => (typeof p === 'object' && 'key' in p ? p.key : String(p)))
                .join('.')
            : String(issue.path || '')

          if (path) {
            ;(newErrors[path] ??= []).push(issue.message)
          }
        }
      }

      if (fieldName) {
        if (newErrors[fieldName]) {
          state._meta.errors[fieldName] = newErrors[fieldName]
        } else {
          delete state._meta.errors[fieldName]
        }
      } else {
        state._meta.errors = newErrors
      }

      return false
    } finally {
      state._meta.isValidating = false
    }
  }

  // HTTP request handler - now uses api module
  async function makeRequest<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options: any = {},
  ): Promise<ApiResult<T>> {
    // Validate before request
    const isFormValid = await validate()
    if (!isFormValid) {
      return {
        success: false,
        error: 'Form validation failed',
        errors: state._meta.errors,
        statusCode: 0,
      }
    }

    state._meta.isSubmitting = true

    try {
      // Get form values
      const values = Object.fromEntries(Object.entries(state).filter(([key]) => key !== '_meta'))

      // Use the api module instead of duplicating logic
      const result =
        method === 'GET'
          ? await api.get<T>(path, { params: options.params, ...options })
          : await api[method.toLowerCase() as 'post' | 'put' | 'patch' | 'delete']<T>(
              path,
              values,
              options,
            )

      state._meta.lastResult = result

      // Handle server errors
      if (!result.success) {
        if (result.errors) {
          state._meta.errors = { ...result.errors }
        } else if (result.error) {
          state._meta.errors._all = [result.error]
        }
      }

      return result
    } finally {
      state._meta.isSubmitting = false
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()

    // Mark all fields as touched
    Object.keys(state).forEach((key) => {
      if (key !== '_meta') state._meta.touched[key] = true
    })

    const isFormValid = await validate()
    if (!isFormValid || !onSubmit) return

    state._meta.isSubmitting = true

    try {
      const values = Object.fromEntries(
        Object.entries(state).filter(([key]) => key !== '_meta'),
      ) as FormData

      await onSubmit(values)
    } catch (error: any) {
      if (error?.errors) {
        state._meta.errors = { ...error.errors }
      } else if (error?.message || error?.error) {
        state._meta.errors._all = [error.message || error.error || 'An error occurred']
      }
    } finally {
      state._meta.isSubmitting = false
    }
  }

  function reset() {
    Object.assign(state, initialValues)
    state._meta.errors = {}
    state._meta.touched = {}
    state._meta.isSubmitting = false
    state._meta.isValidating = false
    state._meta.lastResult = null
  }

  function setErrors(errors: Record<string, string | string[]>) {
    state._meta.errors = {}
    for (const [field, messages] of Object.entries(errors)) {
      state._meta.errors[field] = Array.isArray(messages) ? messages : [messages]
    }
  }

  function clearErrors(field?: string) {
    if (field) {
      delete state._meta.errors[field]
    } else {
      state._meta.errors = {}
    }
  }

  function setValue(name: string, value: any) {
    if (name !== '_meta') {
      state[name] = value
      if (state._meta.touched[name] && validateOn === 'change') {
        validate(name)
      }
    }
  }

  function handleBlur(fieldName: string) {
    state._meta.touched[fieldName] = true
    if (validateOn === 'blur') validate(fieldName)
  }

  // Create the form object
  const form: any = {
    // Simplified errors getter
    get errors() {
      const result = {} as FormErrors<FormData>
      for (const [field, errors] of Object.entries(state._meta.errors)) {
        // Translate error codes
        const firstError = errors[0] || ''
        // If it's an error code (all caps with underscores), translate it
        if (/^[A-Z_]+$/.test(firstError)) {
          ;(result as any)[field] = (m as any)[`apiErrors.${firstError}`]?.() || firstError
        } else {
          ;(result as any)[field] = firstError
        }
      }
      return result
    },

    get touched() {
      return state._meta.touched
    },
    get isSubmitting() {
      return state._meta.isSubmitting
    },
    get isValidating() {
      return state._meta.isValidating
    },
    get lastResult() {
      return state._meta.lastResult
    },

    get isDirty() {
      return Object.keys(initialValues).some(
        (key) => JSON.stringify(state[key]) !== JSON.stringify(initialValues[key]),
      )
    },

    get isValid() {
      return Object.keys(state._meta.errors).length === 0
    },
    get hasErrors() {
      return Object.keys(state._meta.errors).length > 0
    },

    // Methods
    validate,
    handleSubmit,
    handleBlur,
    reset,
    setErrors,
    clearErrors,
    setValue,

    // HTTP methods - now lightweight wrappers
    post: <T = any>(path: string, options?: any) => makeRequest<T>('POST', path, options),
    put: <T = any>(path: string, options?: any) => makeRequest<T>('PUT', path, options),
    patch: <T = any>(path: string, options?: any) => makeRequest<T>('PATCH', path, options),
    delete: <T = any>(path: string, options?: any) => makeRequest<T>('DELETE', path, options),
    get: <T = any>(path: string, options?: any) => makeRequest<T>('GET', path, options),
  }

  // Add field getters and setters
  for (const key in state) {
    if (key !== '_meta') {
      Object.defineProperty(form, key, {
        get: () => state[key],
        set: (value) => setValue(key, value),
        enumerable: true,
        configurable: true,
      })
    }
  }

  return form as FormInstance<TSchema>
}

export type FormValues<TSchema extends GenericSchema> = InferOutput<TSchema>
