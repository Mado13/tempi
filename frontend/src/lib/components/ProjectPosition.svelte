<script lang="ts">
  import Input from '$lib/components/Input.svelte'
  import InputButton from '$lib/components/InputButton.svelte'
  import JobClassificationPicker from '$lib/components/JobClassificationPicker.svelte'
  import PayRate from '$lib/components/PayRate.svelte'
  import Stepper from '$lib/components/Stepper.svelte'
  import type { ItemFormInstance } from '$lib/forms'
  import { projectPositionCreateSchema } from '$lib/schemas/project_position.schema.svelte'
  import { isEmpty } from '$lib/utils/utils'

  interface Props {
    form: ItemFormInstance<typeof projectPositionCreateSchema>
    onRemove: () => void
  }

  let jobClassificationPickerOpen = $state(false)

  let { form, onRemove }: Props = $props()
</script>

<div>
  <Stepper
    label="Employees"
    bind:value={form.numberOfEmployees}
    error={form.errors.numberOfEmployees}></Stepper>
  <InputButton
    label="Classification"
    class={{ placeholder: isEmpty(form.jobClassification) }}
    onclick={() => (jobClassificationPickerOpen = true)}
    error={form.errors.jobClassifications}>
    {#if isEmpty(form.jobClassification)}
      <span>Pick a job</span>
    {:else}
      {form.jobClassification.label}
    {/if}
  </InputButton>
  <JobClassificationPicker
    bind:value={form.jobClassification}
    bind:open={jobClassificationPickerOpen} />
  <PayRate
    bind:value={form.payment.rate}
    rateType={form.payment.rateType}
    error={form.errors.payment} />
</div>
