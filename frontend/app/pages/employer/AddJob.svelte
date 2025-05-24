<!-- AddJob.svelte -->

<script lang="ts">
import { useForm } from '@inertiajs/svelte'
import { CalendarDate } from '@internationalized/date'
import { type DateRange } from '@melt-ui/svelte'
import { watch } from 'runed'

import { validateForm } from '@/helpers/validate-form'
import { type JobFormData, jobFormSchema } from '@/scehmas/job_form.schema'

import PayRateInput from '$components/PayRateInput.svelte'
import ShiftSelector from '$components/ShiftSelector.svelte'
import AddressInput from '$components/UI/AddressInput.svelte'
import DateRangeField from '$components/UI/DateRangeField.svelte'

import { m } from '$paraglide/messages'

let openCalendar = $state<() => void>(() => {})

let { selectedDate }: { selectedDate: CalendarDate } = $props()
let selectedRange = $state<DateRange>({ start: selectedDate, end: undefined })
let form = useForm<JobFormData>({
  startDate: '',
  endDate: '',
  title: '',
  location: undefined,
  pay: {
    rate: undefined,
    type: 'hourly',
  },
  shifts: 'morning',
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
</style>
