<!-- Form.svelte -->

<script lang="ts">
import type { InertiaForm } from '@inertiajs/svelte'
import type { Writable } from 'svelte/store'
import FormField from './FormField.svelte'
import Button from './ui/Button.svelte'

export type Form = InertiaForm<Record<string, any>>

let { form, onsubmit, className, labels } = $props<{
  form: Writable<Form>
  onsubmit: (e: SubmitEvent) => void
  labels: Record<string, string>
  className: string
}>()

const fields = Object.keys($form.data())
</script>

<form class={className} {onsubmit}>
  {#each fields as field}
    <FormField {field} {form} label={labels[field]} />
  {/each}
  <Button type="submit">Submit</Button>
</form>
