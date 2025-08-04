<script lang="ts">
  import { navigate } from '$router'
  import { watch } from 'runed'

  import AddressPicker from '$lib/components/AddressPicker.svelte'
  import Input from '$lib/components/Input.svelte'
  import InputButton from '$lib/components/InputButton.svelte'
  import JobClassificationPicker from '$lib/components/JobClassificationPicker.svelte'
  import PayRate from '$lib/components/PayRate.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import RangeDatePicker from '$lib/components/RangeDatePicker.svelte'
  import Stepper from '$lib/components/Stepper.svelte'
  import { createForm } from '$lib/forms'
  import { jobCreateSchema } from '$lib/schemas/job.scehma.svelte'
  import { useCompaniesStore } from '$lib/stores/resources/companies.store.svelte'
  import { useJobsStore } from '$lib/stores/resources/jobs.store.svelte'
  import { isEmpty } from '$lib/utils/utils'

  const jobs = useJobsStore()
  const companies = useCompaniesStore()

  let addressPickerOpen = $state(false)
  let jobClassificationPickerOpen = $state(false)
  let dateRangePickerState = $state({
    open: false,
    display: 'Pick date placeholder',
  })

  const form = createForm({
    schema: jobCreateSchema,
    defaultValues: {
      companyProfileId: '',
      numberOfEmployees: 1,
      address: undefined,
      jobClassifications: {},
      date: { start: '', end: '' },
      payment: {
        rateType: 'daily',
        rate: NaN,
      },
    },
    async onSubmit(formData) {
      try {
        const created = await jobs.create(formData)
        navigate('/app/:role/jobs', {
          params: { role: 'employer' },
          search: `?highlight=${created.id}`,
        })
      } catch (err) {
        console.log(form.errors._all)
      }
    },
  })

  watch(
    () => companies.items,
    () => {
      form.companyProfileId = companies.items[0].id
    },
  )

  //TODO: Chnage the strucutre places.ts is returning!
  let placeHolderAddress = $derived.by(() => {
    if (!form.address) return 'Pick address'

    if (form.address?.formattedAddress.includes(form.address?.name)) {
      return form.address?.formattedAddress
    }

    return `${form.address?.name}, ${form.address?.formattedAddress}`
  })

  let jobClassificationDisplay = $derived(
    Object.values(form.jobClassifications || {})
      .map((item: any) => (typeof item === 'string' ? item : item.label))
      .join(', '),
  )
</script>

<h1>Create new job</h1>

<form id="add-job-form" onsubmit={form.handleSubmit}>
  {#if companies.items.length === 1}
    {@const company = companies.items[0]}
    <Input label="company" id="company" readonly placeholder={company.name} />
  {/if}
  <Stepper
    label="Employees"
    bind:value={form.numberOfEmployees}
    error={form.errors.numberOfEmployees}></Stepper>
  <!-- date range selection -->
  <InputButton
    label="Date"
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
    class={{ placeholder: isEmpty(form.jobClassifications) }}
    onclick={() => (jobClassificationPickerOpen = true)}
    error={form.errors.jobClassifications}>
    {#if isEmpty(form.jobClassifications)}
      <span>Pick a job</span>
    {:else}
      {jobClassificationDisplay}
    {/if}
  </InputButton>
  <JobClassificationPicker
    bind:value={form.jobClassifications}
    bind:open={jobClassificationPickerOpen} />
  <PayRate
    bind:value={form.payment.rate}
    rateType={form.payment.rateType}
    error={form.errors.payment} />
</form>

<div class="form-actions">
  <PrimaryButton type="submit" form="add-job-form">Create Job</PrimaryButton>
</div>

<style>
  .form-actions {
    width: 100%;
    overflow-y: auto;
    padding: 0 var(--spacing-m);
    margin-bottom: var(--spacing-m);
    position: fixed;
    bottom: var(--bottom-nav-height);
  }
</style>
