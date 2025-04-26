<!-- Form.svelte -->

<script lang="ts">
import type { InertiaForm } from '@inertiajs/svelte'
import type { Writable } from 'svelte/store'
import FormField from './FormField.svelte'
import Button from './ui/Button.svelte'

export type TempiForm = Writable<InertiaForm<Record<string, any>>>

interface FormConfig {
  labels: Record<string, string>
  requiredFields: string[]
}

let { form, formConfig, onsubmit, className } = $props<{
  form: TempiForm
  formConfig: FormConfig
  onsubmit: (e: SubmitEvent) => void
  className: string
}>()

const fields = Object.keys($form.data())
</script>

<form class={className} {onsubmit}>
  {#each fields as field}
    <FormField {field} form={formConfig.form} label={formConfig.labels[field]} />
  {/each}
  <Button type="submit">Submit</Button>
</form>
