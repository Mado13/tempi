<script lang="ts">
  import { navigate } from '$router'

  import { api } from '$lib/api'
  import AddressPicker from '$lib/components/AddressPicker.svelte'
  import InputButton from '$lib/components/InputButton.svelte'
  import JobClassificationPicker from '$lib/components/JobClassificationPicker.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import RangeDatePicker from '$lib/components/RangeDatePicker.svelte'
  import Stepper from '$lib/components/Stepper.svelte'
  import { createForm } from '$lib/forms'
  import { m } from '$lib/i18n/messages'
  import { jobSchema } from '$lib/schemas/job.scehma'
  import { isEmpty } from '$lib/utils/utils'

  let addressPickerOpen = $state(false)
  let jobClassificationPickerOpen = $state(false)
  let dateRangePickerState = $state({
    open: false,
    display: '',
  })

  const form = createForm({
    schema: jobSchema,
    defaultValues: {
      numberOfEmployees: 1,
      address: undefined,
      jobClassification: {},
      date: { start: '', end: '' },
    },
    async onSubmit(formData) {
      await api.post('/jobs', formData)

      navigate('/app/:role/jobs', {
        params: { role: 'employer' },
      })
    },
  })

  //TODO: Chnage the strucutre places.ts is returning!
  let placeHolderAddress = $derived.by(() => {
    if (!form.address) return m['employer.jobs.add.addressPlaceholder']()

    if (form.address?.formattedAddress.includes(form.address?.name)) {
      return form.address?.formattedAddress
    }

    return `${form.address?.name}, ${form.address?.formattedAddress}`
  })

  let jobClassificationDisplay = $derived(
    Object.values(form.jobClassification || {})
      .map((item: any) => (typeof item === 'string' ? item : item.label))
      .join(', '),
  )

  $inspect(form.errors)
</script>

<h1>{m['employer.jobs.add.header']()}</h1>

<form id="add-job-form" onsubmit={form.handleSubmit}>
  <Stepper
    label="Employees"
    bind:value={form.numberOfEmployees}
    error={form.errors.numberOfEmployees}></Stepper>
  <!-- date range selection -->
  <InputButton
    label="date"
    class={{ placeholder: isEmpty(form.date) }}
    onclick={() => (dateRangePickerState.open = true)}
    error={form.errors.date}>{dateRangePickerState.display}</InputButton>
  <RangeDatePicker
    bind:value={form.date}
    bind:open={dateRangePickerState.open}
    bind:display={dateRangePickerState.display} />
  <!-- address selection -->
  <InputButton
    label="Address"
    class={{ placeholder: !form.address }}
    onclick={() => (addressPickerOpen = true)}
    error={form.errors.address}>
    {placeHolderAddress}
  </InputButton>
  <AddressPicker bind:value={form.address} bind:open={addressPickerOpen} />
  <!-- job classification selection -->
  <InputButton
    label="Classification"
    class={{ placeholder: isEmpty(form.jobClassification) }}
    onclick={() => (jobClassificationPickerOpen = true)}
    error={form.errors.jobClassification}>
    {isEmpty(form.jobClassification) ? 'Pick a job...' : jobClassificationDisplay}
  </InputButton>
  <JobClassificationPicker
    bind:value={form.jobClassification}
    bind:open={jobClassificationPickerOpen} />
</form>

<div class="form-actions">
  <PrimaryButton type="submit" form="add-job-form">Create Job</PrimaryButton>
</div>

<style>
  .form-actions {
    width: 100%;
    padding: 0 var(--spacing-m);
    margin-bottom: var(--spacing-m);
    position: fixed;
    bottom: var(--bottom-nav-height);
  }
</style>
