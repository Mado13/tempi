// forms/types.ts - All type definitions in one place
import type { GenericSchema, InferOutput } from 'valibot'

// We still need ApiResult for the lastResult property
import type { ApiResult } from '$lib/api'

export interface FormConfig<TSchema extends GenericSchema> {
  schema: TSchema
  defaultValues?: Partial<InferOutput<TSchema>>
  onSubmit?: (values: InferOutput<TSchema>) => Promise<void> | void
}

export interface FieldMeta {
  touched: boolean
  errors: string[]
  validating: boolean
  validated: boolean
}

export interface FormMeta {
  fields: Record<string, FieldMeta>
  submitting: boolean
  // lastResult is kept for potential debugging or complex UI logic
  lastResult: ApiResult | null
}

export type FormErrors<T> = {
  [K in keyof T]?: string
} & {
  _all?: string[]
}

export type FormInstance<TSchema extends GenericSchema> = InferOutput<TSchema> & {
  // Computed properties
  errors: FormErrors<InferOutput<TSchema>>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValidating: boolean
  isDirty: boolean
  isValid: boolean
  hasErrors: boolean
  lastResult: ApiResult | null

  // Field helpers
  isFieldValid: (fieldName: string) => boolean

  // Core methods
  validate: (fieldName?: string) => Promise<boolean>
  handleSubmit: (e: Event) => Promise<void>
  handleBlur: (fieldName: string) => void
  setValue: (name: string, value: any) => void
  reset: () => void
  setErrors: (errors: Record<string, string | string[]>) => void
  clearErrors: (field?: string) => void

  // HTTP method signatures have been removed.
}

export interface MobileOptions {
  firstErrorDelay?: number
  enableHapticFeedback?: boolean
  // retryOnNetworkError is no longer needed here
}
