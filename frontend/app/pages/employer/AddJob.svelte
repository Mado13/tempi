<!-- AddJob.svelte -->

<script lang="ts">
import { useForm } from '@inertiajs/svelte'
import { type DateValue } from '@internationalized/date'
import { type DateRange } from '@melt-ui/svelte'
import { watch } from 'runed'

import FormField from '@/components/ui/FormField.svelte'
import JobClassSelector from '@/components/ui/JobClassSelector.svelte'
import { validateForm } from '@/helpers/validate-form'
import { type JobFormData, jobFormSchema } from '@/schemas/job_form.schema'

import AddressInput from '$components/ui/AddressInput.svelte'
import DateRangeField from '$components/ui/DateRangeField.svelte'
import PayRateInput from '$components/ui/PayRateInput.svelte'
import ShiftSelector from '$components/ui/ShiftSelector.svelte'

import { m } from '$i18n/paraglide/messages'

let openCalendar = $state<() => void>(() => {})

let { selectedDate }: { selectedDate?: DateValue } = $props()
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
  jobClassId: '',
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
</script>

<h1>{m['add_job.job_title.value']()}</h1>
<form {onsubmit}>
  <FormField
    id="title"
    label={m['add_job.job_title.value']()}
    bind:value={$form.title}
    error={$form.errors.title}
  />
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
