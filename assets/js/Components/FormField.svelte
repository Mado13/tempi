<!-- FormField.svelte -->

<script lang="ts">
import type { InertiaForm } from '@inertiajs/svelte'
import type { Writable } from 'svelte/store'
import { handleInputValidation } from '../helpers/input_validation'

let { field, form, label } = $props<{
  field: string
  form: Writable<InertiaForm<Record<string, any>>>
  label: string
}>()

function inputType(value: any): string {
  if (typeof value === 'boolean') return 'checkbox'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') return 'text'
  if (value instanceof Date) return 'date'
  return 'text'
}

function updateField(e: Event) {
  const target = e.target as HTMLInputElement
  form.update((f: InertiaForm<Record<string, any>>) => {
    if (type === 'checkbox') {
      f[field] = target.checked
    } else {
      f[field] = target.value
    }
    return f
  })
  $form.clearErrors(field)
}

const type = inputType($form.data()[field])
</script>

<div>
  <label for={field}>{label}</label>
  {#if type === 'checkbox'}
    <input
      type="checkbox"
      id={field}
      name={field}
      checked={$form[field]}
      class:error={$form.errors[field]}
      oninvalid={e => handleInputValidation(e, $form)}
      onchange={updateField}
    />
  {:else}
    <input
      {type}
      id={field}
      name={field}
      value={$form.data[field]}
      class:error={$form.errors[field]}
      oninvalid={e => handleInputValidation(e, $form)}
      oninput={updateField}
      required
    />
  {/if}

  <div class="form-error">{$form.errors[field]}</div>
</div>

<style lang="scss">
div {
  input.error {
    border: 1px solid red;
  }
}
</style>
