// forms/index.ts - Main entry point
export { createForm } from './create-form'
export type { FormInstance, FormConfig, FormErrors, MobileOptions } from './types'

// Re-export for convenience
export type { InferOutput as FormValues } from 'valibot'
