// forms/nested-field.svelte.ts - Surgical extension for nested fields
import type { GenericSchema, InferOutput } from 'valibot'

import { createFormState } from './form-state.svelte'
import { triggerHaptic } from './mobile-utils'
import type { FormInstance } from './types'
import {
  MOBILE_ERROR_DELAY,
  shouldShowErrors,
  shouldValidateField,
  validateFieldValue,
} from './validation'

export interface NestedFieldConfig<TItemSchema extends GenericSchema> {
  itemSchema: TItemSchema
  defaultValues: InferOutput<TItemSchema>
  enableHapticFeedback?: boolean
  firstErrorDelay?: number
}

export interface NestedFieldInstance<TItemSchema extends GenericSchema> {
  // Array state
  items: InferOutput<TItemSchema>[]

  // Array operations
  add: () => void
  remove: (index: number) => void
  move: (from: number, to: number) => void

  // Validation
  validateItem: (index: number) => boolean
  validateAll: () => boolean

  // State queries
  isValid: boolean
  hasErrors: boolean

  // Helper for individual item forms
  getFormForIndex: (index: number) => ItemFormInstance<TItemSchema>
}

export type ItemFormInstance<TItemSchema extends GenericSchema> = InferOutput<TItemSchema> & {
  setValue: (field: string, value: any) => void
  handleBlur: (field: string) => void
  validate: () => boolean
  isValid: boolean
  errors: Record<string, string>
}

export function createNestedField<TItemSchema extends GenericSchema>(
  parentForm: FormInstance<any>,
  fieldName: string,
  config: NestedFieldConfig<TItemSchema>,
): NestedFieldInstance<TItemSchema> {
  type ItemData = InferOutput<TItemSchema>

  const {
    itemSchema,
    defaultValues,
    enableHapticFeedback = true,
    firstErrorDelay = MOBILE_ERROR_DELAY,
  } = config

  // Get initial items from parent form
  const initialItems = (parentForm[fieldName as keyof typeof parentForm] as ItemData[]) || []

  // Local state for the array
  const items = $state<ItemData[]>([...initialItems])

  // Create a form state for tracking item-level metadata
  const itemsState = createFormState({})

  // Extract field schemas from item schema (reuse logic from main form)
  const fieldSchemas = new Map<string, GenericSchema>()
  if ('entries' in itemSchema && itemSchema.entries && typeof itemSchema.entries === 'object') {
    Object.entries(itemSchema.entries).forEach(([key, fieldSchema]) => {
      if (fieldSchema) fieldSchemas.set(key, fieldSchema as GenericSchema)
    })
  }

  // Track debounce timers (same as main form)
  const errorTimers = new Map<string, ReturnType<typeof setTimeout>>()

  // Sync items back to parent form whenever items change
  function sync() {
    parentForm.setValue(fieldName, [...items])
  }

  // Hook into parent form's handleSubmit to trigger nested validation first
  const originalHandleSubmit = parentForm.handleSubmit
  parentForm.handleSubmit = async (e: Event) => {
    // Trigger nested field validation first
    validateAll()

    // Mark all nested fields as touched (for UI display)
    for (let i = 0; i < items.length; i++) {
      fieldSchemas.forEach((_, fname) => {
        const fkey = `${i}.${fname}`
        itemsState.setTouched(fkey)
        itemsState.setValidated(fkey)
      })
    }

    // Call original handleSubmit
    return originalHandleSubmit(e)
  }

  // Add new item
  function add() {
    items.push(structuredClone(defaultValues))
    sync()
  }

  // Remove item at index
  function remove(index: number) {
    if (index >= 0 && index < items.length) {
      items.splice(index, 1)

      // Clean up metadata for removed item and reindex
      const newFields: Record<string, any> = {}
      Object.keys(itemsState.meta.fields).forEach((key) => {
        const [itemIndex, fieldPath] = key.split('.', 2)
        const idx = parseInt(itemIndex)

        if (idx < index) {
          // Keep items before removed index
          newFields[key] = itemsState.meta.fields[key]
        } else if (idx > index) {
          // Reindex items after removed index
          const newKey = `${idx - 1}.${fieldPath}`
          newFields[newKey] = itemsState.meta.fields[key]
        }
        // Skip the removed index
      })

      // Clear timers for removed item
      errorTimers.forEach((timer, key) => {
        if (key.startsWith(`${index}.`)) {
          clearTimeout(timer)
          errorTimers.delete(key)
        }
      })

      itemsState.meta.fields = newFields
      sync()
    }
  }

  // Move item from one index to another
  function move(from: number, to: number) {
    if (from >= 0 && from < items.length && to >= 0 && to < items.length && from !== to) {
      const [item] = items.splice(from, 1)
      items.splice(to, 0, item)

      // For simplicity, clear all metadata on reorder
      itemsState.meta.fields = {}
      errorTimers.clear()

      sync()
    }
  }

  // Validate single field in item (reusing main form logic)
  async function validateField(
    index: number,
    fieldName: string,
    trigger: 'blur' | 'change' | 'submit',
    isFirstBlur: boolean = false,
  ): Promise<boolean> {
    const fieldSchema = fieldSchemas.get(fieldName)
    if (!fieldSchema) return true

    const fieldKey = `${index}.${fieldName}`
    const fieldMeta = itemsState.getFieldMeta(fieldKey)

    // Check if we should validate (reuse main form logic)
    if (!shouldValidateField(fieldMeta, trigger)) {
      return fieldMeta.errors.length === 0
    }

    itemsState.setValidating(fieldKey, true)

    try {
      const value = items[index][fieldName as keyof ItemData]
      const result = validateFieldValue(fieldSchema, value)

      // Clear any pending error timer
      if (errorTimers.has(fieldKey)) {
        clearTimeout(errorTimers.get(fieldKey)!)
        errorTimers.delete(fieldKey)
      }

      // Determine if we should show errors (reuse main form logic)
      if (shouldShowErrors(fieldMeta, trigger)) {
        if (isFirstBlur && trigger === 'blur' && !result.valid) {
          // First time showing error - use delay
          const timer = setTimeout(() => {
            itemsState.setFieldErrors(fieldKey, result.errors)
            itemsState.setValidated(fieldKey, true)
            if (enableHapticFeedback) {
              triggerHaptic('error')
            }
            errorTimers.delete(fieldKey)
          }, firstErrorDelay)

          errorTimers.set(fieldKey, timer)
        } else if (result.valid) {
          // Clear errors immediately on valid input
          itemsState.setFieldErrors(fieldKey, [])
          itemsState.setValidated(fieldKey, true)

          // Success haptic if we just cleared an error
          if (fieldMeta.errors.length > 0 && enableHapticFeedback) {
            triggerHaptic('success')
          }
        } else if (trigger === 'submit' || (trigger === 'blur' && !isFirstBlur)) {
          // Show errors immediately on submit or subsequent blurs
          itemsState.setFieldErrors(fieldKey, result.errors)
          itemsState.setValidated(fieldKey, true)
          if (enableHapticFeedback && result.errors.length > 0) {
            triggerHaptic('error')
          }
        }
      }

      return result.valid
    } finally {
      itemsState.setValidating(fieldKey, false)
    }
  }

  // Handle blur event (same as main form)
  function handleBlur(index: number, fieldName: string) {
    const fieldKey = `${index}.${fieldName}`
    const fieldMeta = itemsState.getFieldMeta(fieldKey)
    const isFirstBlur = !fieldMeta.touched

    itemsState.setTouched(fieldKey)
    validateField(index, fieldName, 'blur', isFirstBlur)
  }

  // Handle value change (same as main form)
  function handleValueChange(index: number, fieldName: string) {
    const fieldKey = `${index}.${fieldName}`
    const fieldMeta = itemsState.getFieldMeta(fieldKey)
    if (fieldMeta.touched && fieldMeta.errors.length > 0) {
      validateField(index, fieldName, 'change')
    }
  }

  // Validate single item (for full item validation)
  function validateItem(index: number): boolean {
    if (index < 0 || index >= items.length) return false

    let allValid = true

    // Validate each field in the item
    fieldSchemas.forEach((_, fieldName) => {
      const isValid = validateField(index, fieldName, 'submit')
      if (!isValid) allValid = false
    })

    return allValid
  }

  // Validate all items
  function validateAll(): boolean {
    let allValid = true

    for (let i = 0; i < items.length; i++) {
      const isValid = validateItem(i)
      if (!isValid) allValid = false
    }

    return allValid
  }

  // Create form instance for individual item
  function getFormForIndex(index: number): ItemFormInstance<TItemSchema> {
    const itemForm: any = {
      get isValid() {
        // Just check if there are any errors for this item - don't trigger validation
        const itemErrors = itemsState.getErrors()
        return !Object.keys(itemErrors).some((key) => key.startsWith(`${index}.`))
      },

      get errors() {
        const errors: Record<string, string> = {}
        // Get item-specific errors
        const itemErrors = itemsState.getErrors()
        Object.entries(itemErrors).forEach(([key, fieldErrors]) => {
          if (key.startsWith(`${index}.`) && fieldErrors.length > 0) {
            const fieldName = key.substring(`${index}.`.length)
            errors[fieldName] = fieldErrors[0] // First error only for mobile
          }
        })
        return errors
      },

      setValue: (field: string, value: any) => {
        if (index >= 0 && index < items.length) {
          const currentItem = items[index]
          items[index] = Object.assign({}, currentItem, { [field]: value }) as ItemData
          sync()
          // Trigger change validation (same as main form)
          handleValueChange(index, field)
        }
      },

      handleBlur: (field: string) => {
        // Handle blur exactly like main form
        handleBlur(index, field)
      },

      validate: () => validateItem(index),
    }

    // Add reactive field accessors (same pattern as main form)
    fieldSchemas.forEach((_, fieldName) => {
      Object.defineProperty(itemForm, fieldName, {
        get: () => items[index]?.[fieldName as keyof ItemData],
        set: (value) => itemForm.setValue(fieldName, value),
        enumerable: true,
        configurable: true,
      })
    })

    return itemForm as ItemFormInstance<TItemSchema>
  }

  // Create reactive getters
  const instance = {
    get items() {
      return items
    },

    get isValid() {
      return validateAll()
    },

    get hasErrors() {
      return !this.isValid
    },

    // Methods
    add,
    remove,
    move,
    validateItem,
    validateAll,
    getFormForIndex,
  } as NestedFieldInstance<TItemSchema>

  return instance
}
