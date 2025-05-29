<!-- AddJob.svelte -->

<script lang="ts">
import { useForm } from '@inertiajs/svelte'
import { CalendarDate } from '@internationalized/date'
import { type DateRange } from '@melt-ui/svelte'
import { watch } from 'runed'

import JobClassSelector from '@/components/ui/JobClassSelector.svelte'
import { validateForm } from '@/helpers/validate-form'
import { type JobFormData, jobFormSchema } from '@/schemas/job_form.schema'

import AddressInput from '$components/ui/AddressInput.svelte'
import DateRangeField from '$components/ui/DateRangeField.svelte'
import PayRateInput from '$components/ui/PayRateInput.svelte'
import ShiftSelector from '$components/ui/ShiftSelector.svelte'

import { m } from '$i18n/paraglide/messages'

let openCalendar = $state<() => void>(() => {})

let { selectedDate }: { selectedDate: CalendarDate } = $props()
let selectedRange = $state<DateRange>({ start: selectedDate, end: undefined })
let form = useForm<JobFormData>({
  startDate: '',
  endDate: '',
  title: '',
  location: undefined,
  pay: {
    rate: 0,
    type: 'hourly',
  },
  shifts: 'morning',
  jobClassId: 0,
})

watch<DateRange>(
  () => selectedRange,
  curr => {
    $form.startDate = curr.start?.toString() ?? ''
    $form.endDate = curr.end?.toString() ?? ''
  },
  { lazy: true },
)

const onsubmit = (e: SubmitEvent) => {
  e.preventDefault()

  const isValid = validateForm($form, jobFormSchema)

  if (isValid) {
    $form.post('/employer/jobs')
  }
}

$inspect($form)
</script>

<h1>{m['add_job.job_title.value']()}</h1>
<form {onsubmit}>
  <div class="input-group">
    <label for="title">{m['add_job.job_title.value']()}</label>
    <input id="title" type="text" bind:value={$form.title} class:error={$form.errors.title} />
    <div class="form-error">{$form.errors.title}</div>
  </div>
  <div class="input-group">
    <AddressInput bind:selected={$form.location} />
    <div class="form-error">{$form.errors.location}</div>
  </div>
  <div class="input-group">
    <JobClassSelector bind:selected={$form.jobClassId} />
    <div class="form-error">{$form.errors.jobClassId}</div>
  </div>
  <div class="input-group">
    <DateRangeField
      bind:value={selectedRange}
      bind:open={openCalendar}
      title={m['add_job.date.title']()}
      startName="jobStart"
      endName="jobEnds"
    />
    <!-- <button onclick={() => openCalendar()}>Open</button> -->
    <div class="form-error">{$form.errors.startDate}</div>
  </div>
  <div class="input-group">
    <ShiftSelector bind:value={$form.shifts} />
    <div class="form-error">{$form.errors.shifts}</div>
  </div>
  <div class="input-group">
    <PayRateInput bind:type={$form.pay.type} bind:rate={$form.pay.rate} />
    <div class="form-error">{$form.errors.pay}</div>
  </div>
  <button type="submit">{m['add_job.submit_button']()}</button>
</form>

<style lang="scss">
form {
  display: flex;
  flex-direction: column;
  > .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  button {
    margin-top: 1rem;
  }
}

.form-error {
  min-height: 1.2em; // Reserve space for one line of error text
  font-size: 0.875rem; // Smaller text (14px if base is 16px)
  color: #dc2626; // Red color
  line-height: 1.2;
  opacity: 0; // Hidden by default
  transition: opacity 0.2s ease-in-out; // Smooth fade-in
  
  // Show error when there's content
  &:not(:empty) {
    opacity: 1;
  }
}
</style>
