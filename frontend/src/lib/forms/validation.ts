// forms/validation.ts - Pure validation functions
import { type GenericSchema, safeParse } from 'valibot'

import type { FieldMeta } from './types'

// Mobile-friendly validation delays
export const MOBILE_ERROR_DELAY = 500 // ms - longer for mobile to reduce distraction

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// Simple validation without side effects
export function validateFieldValue(schema: GenericSchema, value: any): ValidationResult {
  const result = safeParse(schema, value)
  const errors = result.success ? [] : result.issues.map((i) => i.message)

  // CORRECTED: Only log if there are actual errors.
  if (errors.length > 0) {
    console.error(`Field validation failed:`, { value, errors })
  }

  return {
    valid: result.success,
    errors: errors,
  }
}

// Validate entire form
export function validateFormValues(
  schema: GenericSchema,
  values: Record<string, any>,
): Record<string, string[]> {
  const result = safeParse(schema, values)

  if (result.success) {
    return {}
  }

  const errors: Record<string, string[]> = {}

  for (const issue of result.issues) {
    const path = extractPath(issue.path)
    if (path) {
      ;(errors[path] ??= []).push(issue.message)
      console.error(`Form validation error for field "${path}":`, issue.message)
    }
  }

  console.error('Full form validation failed:', { values, errors })
  return errors
}

// Extract path from valibot issue
function extractPath(path: any): string {
  if (!path) return ''

  if (Array.isArray(path)) {
    return path.map((p) => (typeof p === 'object' && 'key' in p ? p.key : String(p))).join('.')
  }

  return String(path)
}

// Mobile-optimized validation strategy
export function shouldValidateField(
  fieldMeta: FieldMeta,
  trigger: 'blur' | 'change' | 'submit',
): boolean {
  // Always validate on submit
  if (trigger === 'submit') return true

  // On blur, always validate if touched
  if (trigger === 'blur') return true

  // On change, only validate if there are existing errors (to clear them)
  if (trigger === 'change') {
    return fieldMeta.errors.length > 0
  }

  return false
}

// Determine if we should show errors based on interaction
export function shouldShowErrors(
  fieldMeta: FieldMeta,
  trigger: 'blur' | 'change' | 'submit',
): boolean {
  // Always show on submit
  if (trigger === 'submit') return true

  // Show on blur if field is touched
  if (trigger === 'blur' && fieldMeta.touched) return true

  // Only show on change if already showing errors
  if (trigger === 'change' && fieldMeta.errors.length > 0) return true

  return false
}
