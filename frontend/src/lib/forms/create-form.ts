// forms/create-form.ts - Simplified form creation
import type { GenericSchema, InferOutput } from 'valibot'

import { getErrorMessage } from '$lib/i18n/errors.svelte'

import { createFormState } from './form-state.svelte'
import { formatFieldError, triggerHaptic } from './mobile-utils'
import type { FormConfig, FormInstance, MobileOptions } from './types'
import {
  MOBILE_ERROR_DELAY,
  shouldShowErrors,
  shouldValidateField,
  validateFieldValue,
  validateFormValues,
} from './validation'

// Extract field schemas from main schema
function extractFieldSchemas(schema: GenericSchema): Map<string, GenericSchema> {
  const fieldSchemas = new Map<string, GenericSchema>()

  if ('entries' in schema && schema.entries && typeof schema.entries === 'object') {
    Object.entries(schema.entries).forEach(([key, fieldSchema]) => {
      if (fieldSchema) fieldSchemas.set(key, fieldSchema as GenericSchema)
    })
  }

  return fieldSchemas
}

export function createForm<TSchema extends GenericSchema>(
  config: FormConfig<TSchema>,
  mobileOptions: MobileOptions = {},
): FormInstance<TSchema> {
  type FormData = InferOutput<TSchema>

  const { schema, defaultValues = {} as Partial<FormData>, onSubmit } = config

  const {
    firstErrorDelay = MOBILE_ERROR_DELAY,
    enableHapticFeedback = true,
    // retryOnNetworkError is no longer used here
  } = mobileOptions

  // Initialize state
  const state = createFormState(defaultValues as Record<string, any>)
  const fieldSchemas = extractFieldSchemas(schema)

  // Track debounce timers
  const errorTimers = new Map<string, ReturnType<typeof setTimeout>>()

  // Validate a single field
  async function validateField(
    fieldName: string,
    trigger: 'blur' | 'change' | 'submit',
    isFirstBlur: boolean = false,
  ): Promise<boolean> {
    const fieldSchema = fieldSchemas.get(fieldName)
    if (!fieldSchema) return true

    const fieldMeta = state.getFieldMeta(fieldName)

    // Check if we should validate
    if (!shouldValidateField(fieldMeta, trigger)) {
      return fieldMeta.errors.length === 0
    }

    state.setValidating(fieldName, true)

    try {
      const value = state.getValue(fieldName)
      const result = validateFieldValue(fieldSchema, value)

      // Clear any pending error timer
      if (errorTimers.has(fieldName)) {
        clearTimeout(errorTimers.get(fieldName)!)
        errorTimers.delete(fieldName)
      }

      // Determine if we should show errors
      if (shouldShowErrors(fieldMeta, trigger)) {
        if (isFirstBlur && trigger === 'blur' && !result.valid) {
          // First time showing error - use delay
          const timer = setTimeout(() => {
            state.setFieldErrors(fieldName, result.errors)
            state.setValidated(fieldName, true)
            if (enableHapticFeedback) {
              triggerHaptic('error')
            }
            errorTimers.delete(fieldName)
          }, firstErrorDelay)

          errorTimers.set(fieldName, timer)
        } else if (result.valid) {
          // Clear errors immediately on valid input
          state.setFieldErrors(fieldName, [])
          state.setValidated(fieldName, true)

          // Success haptic if we just cleared an error
          if (fieldMeta.errors.length > 0 && enableHapticFeedback) {
            triggerHaptic('success')
          }
        } else if (trigger === 'submit' || (trigger === 'blur' && !isFirstBlur)) {
          // Show errors immediately on submit or subsequent blurs
          state.setFieldErrors(fieldName, result.errors)
          state.setValidated(fieldName, true)
          if (enableHapticFeedback && result.errors.length > 0) {
            triggerHaptic('error')
          }
        }
      }

      return result.valid
    } finally {
      state.setValidating(fieldName, false)
    }
  }

  // Handle blur event
  function handleBlur(fieldName: string) {
    const fieldMeta = state.getFieldMeta(fieldName)
    const isFirstBlur = !fieldMeta.touched

    state.setTouched(fieldName)
    validateField(fieldName, 'blur', isFirstBlur)
  }

  // Handle value change
  function handleValueChange(fieldName: string) {
    // Only validate on change if field has been touched and has errors
    const fieldMeta = state.getFieldMeta(fieldName)
    if (fieldMeta.touched && fieldMeta.errors.length > 0) {
      validateField(fieldName, 'change')
    }
  }

  // Validate entire form
  async function validate(fieldName?: string): Promise<boolean> {
    if (fieldName) {
      return validateField(fieldName, 'submit')
    }

    // Clear all timers before validating
    errorTimers.forEach((timer) => clearTimeout(timer))
    errorTimers.clear()

    // Mark all fields as touched and validated
    fieldSchemas.forEach((_, key) => {
      state.setTouched(key)
      state.setValidated(key)
    })

    // Validate all fields
    const errors = validateFormValues(schema, state.getValues())
    state.setErrors(errors)

    // Mark all fields as validated after full validation
    fieldSchemas.forEach((_, fieldName) => {
      state.setValidated(fieldName)
    })

    const isValid = Object.keys(errors).length === 0

    if (!isValid && enableHapticFeedback) {
      triggerHaptic('error')
    }

    return isValid
  }

  // Handle form submission
  async function handleSubmit(e: Event) {
    e.preventDefault()

    const isValid = await validate()

    if (!isValid) {
      console.error('Form submission blocked - validation failed:', {
        errors: state.getErrors(),
        values: state.getValues(),
      })
      return
    }

    if (!onSubmit) {
      console.error('Form submission blocked - no onSubmit handler')
      return
    }

    state.setSubmitting(true)

    try {
      await onSubmit(state.getValues() as FormData)
    } catch (error: any) {
      // Handle submission errors thrown from the store
      if (error?.errors) {
        state.setErrors(error.errors)
      } else {
        state.setErrors({
          _all: [error?.error || error?.message || getErrorMessage('UNKNOWN_ERROR')],
        })
      }

      if (enableHapticFeedback) {
        triggerHaptic('error')
      }
    } finally {
      state.setSubmitting(false)
    }
  }

  // Create the form instance with getters
  const form: any = {
    get errors() {
      const errors = state.getErrors()
      const formatted: any = {}

      Object.entries(errors).forEach(([field, fieldErrors]) => {
        const formatted_error = formatFieldError(fieldErrors)
        if (formatted_error) {
          formatted[field] = formatted_error
        }
      })

      return formatted
    },

    get touched() {
      return state.getTouched()
    },

    get isSubmitting() {
      return state.meta.submitting
    },

    get isValidating() {
      return state.isAnyFieldValidating()
    },

    get isDirty() {
      return state.isDirty()
    },

    get isValid() {
      return state.isValid()
    },

    get hasErrors() {
      return state.hasErrors()
    },

    get lastResult() {
      return state.meta.lastResult
    },

    // Methods
    validate,
    handleSubmit,
    handleBlur,
    setValue: (name: string, value: any) => {
      state.setValue(name, value)
      handleValueChange(name)
    },
    reset: () => {
      // Clear all timers
      errorTimers.forEach((timer) => clearTimeout(timer))
      errorTimers.clear()

      state.reset()
    },
    setErrors: (errors: Record<string, string | string[]>) => {
      const normalizedErrors: Record<string, string[]> = {}
      Object.entries(errors).forEach(([field, error]) => {
        normalizedErrors[field] = Array.isArray(error) ? error : [error]
        // Mark field as touched and validated when setting errors
        state.setTouched(field)
        state.setValidated(field)
      })
      state.setErrors(normalizedErrors)
    },
    clearErrors: (field?: string) => {
      if (field) {
        state.clearFieldErrors(field)
      } else {
        state.clearAllErrors()
      }
    },

    // Field helpers - fixed logic
    isFieldValid: (fieldName: string) => {
      const fieldMeta = state.getFieldMeta(fieldName)
      const value = state.getValue(fieldName)

      return (
        fieldMeta.validated &&
        fieldMeta.errors.length === 0 &&
        value !== '' &&
        value !== null &&
        value !== undefined
      )
    },

    // The HTTP methods from the wrapper have been removed
  }

  // Add reactive field accessors for all schema fields
  fieldSchemas.forEach((_, fieldName) => {
    Object.defineProperty(form, fieldName, {
      get: () => state.getValue(fieldName),
      set: (value) => form.setValue(fieldName, value),
      enumerable: true,
      configurable: true,
    })
  })

  return form as FormInstance<TSchema>
}
