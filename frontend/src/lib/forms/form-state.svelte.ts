// forms/form-state.svelte.ts - Simplified state management
import type { ApiResult } from '$lib/api'

import type { FieldMeta, FormMeta } from './types'

export function createFormState(initialValues: Record<string, any>) {
  // Form values - reactive
  const values = $state({ ...initialValues })

  // Form metadata - using object instead of Map for reactivity
  const meta = $state<FormMeta>({
    fields: {},
    submitting: false,
    lastResult: null,
  })

  // Get or create field metadata - now properly reactive
  function getFieldMeta(fieldName: string): FieldMeta {
    if (!meta.fields[fieldName]) {
      // This assignment will be reactive
      meta.fields[fieldName] = {
        touched: false,
        errors: [],
        validating: false,
        validated: false,
      }
    }
    return meta.fields[fieldName]
  }

  // Set field value
  function setValue(fieldName: string, value: any) {
    values[fieldName] = value
  }

  // Get field value
  function getValue(fieldName: string): any {
    return values[fieldName]
  }

  // Get all values (excluding metadata)
  function getValues(): Record<string, any> {
    return { ...values }
  }

  // Mark field as touched - now properly reactive
  function setTouched(fieldName: string, touched: boolean = true) {
    const field = getFieldMeta(fieldName)
    field.touched = touched
  }

  // Set field errors - now properly reactive
  function setFieldErrors(fieldName: string, errors: string[]) {
    const field = getFieldMeta(fieldName)
    // Force reactivity by reassigning array
    field.errors = [...errors]
  }

  // Clear field errors
  function clearFieldErrors(fieldName: string) {
    const field = getFieldMeta(fieldName)
    field.errors = []
  }

  // Set all errors at once
  function setErrors(errors: Record<string, string[]>) {
    // Clear existing errors
    Object.keys(meta.fields).forEach((fieldName) => {
      meta.fields[fieldName].errors = []
    })

    // Set new errors
    Object.entries(errors).forEach(([fieldName, fieldErrors]) => {
      setFieldErrors(fieldName, fieldErrors)
    })
  }

  // Clear all errors
  function clearAllErrors() {
    Object.keys(meta.fields).forEach((fieldName) => {
      meta.fields[fieldName].errors = []
    })
  }

  // Set validating state - now properly reactive
  function setValidating(fieldName: string, validating: boolean) {
    const field = getFieldMeta(fieldName)
    field.validating = validating
  }

  // Mark field as validated
  function setValidated(fieldName: string, validated: boolean = true) {
    const field = getFieldMeta(fieldName)
    field.validated = validated
  }

  // Check if form is valid
  function isValid(): boolean {
    return Object.values(meta.fields).every((field) => field.errors.length === 0)
  }

  // Check if form has errors
  function hasErrors(): boolean {
    return !isValid()
  }

  // Check if form is dirty
  function isDirty(): boolean {
    return Object.keys(initialValues).some(
      (key) => JSON.stringify(values[key]) !== JSON.stringify(initialValues[key]),
    )
  }

  // Get all touched fields
  function getTouched(): Record<string, boolean> {
    const touched: Record<string, boolean> = {}
    Object.entries(meta.fields).forEach(([name, field]) => {
      if (field.touched) touched[name] = true
    })
    return touched
  }

  // Get all errors formatted for display
  function getErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {}
    Object.entries(meta.fields).forEach(([name, field]) => {
      if (field.errors.length > 0) {
        errors[name] = field.errors
      }
    })
    return errors
  }

  // Reset form to initial state
  function reset() {
    // Reset values
    Object.keys(values).forEach((key) => {
      values[key] = initialValues[key]
    })

    // Clear all field metadata
    meta.fields = {}
    meta.submitting = false
    meta.lastResult = null
  }

  // Set submission state
  function setSubmitting(submitting: boolean) {
    meta.submitting = submitting
  }

  // Set last API result
  function setLastResult(result: ApiResult | null) {
    meta.lastResult = result
  }

  // Check if any field is validating
  function isAnyFieldValidating(): boolean {
    return Object.values(meta.fields).some((field) => field.validating)
  }

  return {
    // Values
    values,
    getValues,
    setValue,
    getValue,

    // Field metadata
    getFieldMeta,
    setTouched,
    setFieldErrors,
    clearFieldErrors,
    setValidating,
    setValidated,

    // Form-level operations
    setErrors,
    clearAllErrors,
    isValid,
    hasErrors,
    isDirty,
    getTouched,
    getErrors,
    reset,

    // Submission
    setSubmitting,
    setLastResult,
    isAnyFieldValidating,

    // Direct access to meta
    meta,
  }
}

export type FormState = ReturnType<typeof createFormState>
