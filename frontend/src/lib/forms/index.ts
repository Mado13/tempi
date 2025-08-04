// forms/index.ts - Main entry point
export { createForm } from './create-form'
export { createNestedField } from './create-nested-field.svelte'
export type { FormInstance, FormConfig, FormErrors, MobileOptions } from './types'
export type {
  NestedFieldInstance,
  NestedFieldConfig,
  ItemFormInstance,
} from './create-nested-field.svelte'
// Re-export for convenience
export type { InferOutput as FormValues } from 'valibot'
