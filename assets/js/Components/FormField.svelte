<!-- FormField.svelte -->

<script lang="ts">
import { handleInputValidation } from '../helpers/input_validation'
import type { TempiForm } from './Form.svelte'

let { field, form, label } = $props<{
  field: string
  form: TempiForm
  label: string
}>()

function inputType(value: any): string {
  switch (typeof value) {
    case 'boolean':
      return 'checkbox'
    case 'number':
      return 'number'
    case 'string':
      return 'text'
    default:
      if (value instanceof Date) return 'date'
      return 'text'
  }
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
      bind:checked={$form[field]}
      class:error={$form.errors[field]}
      oninvalid={e => handleInputValidation(e, $form)}
    />
  {:else}
    <input
      {type}
      id={field}
      name={field}
      bind:value={$form[field]}
      class:error={$form.errors[field]}
      oninvalid={e => handleInputValidation(e, $form)}
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
