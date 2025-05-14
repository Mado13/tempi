<!-- AddJob.svelte -->

<script lang="ts">
import { useForm } from '@inertiajs/svelte'
import { CalendarDate } from '@internationalized/date'
import { type DateRange } from '@melt-ui/svelte'
import { watch } from 'runed'

import { validateForm } from '@/helpers/validate-form'
import { type JobFormData, jobFormSchema } from '@/scehmas/job.schema'

import AddressInput from '$components/UI/AddressInput.svelte'
import DateRangeField from '$components/UI/DateRangeField.svelte'

import { m } from '$paraglide/messages'

let { selectedDate }: { selectedDate: CalendarDate } = $props()
let selectedRange = $state<DateRange>({ start: selectedDate, end: undefined })
let form = useForm<JobFormData>({
  startDate: '',
  endDate: '',
  title: '',
  location: undefined,
})

watch(
  () => selectedRange,
  () => {
    $form.startDate = selectedRange.start!.toString()
    $form.endDate = selectedRange.end!.toString()
  },
  {
    lazy: true,
  },
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

<h1>{m.add_job_page_title()}</h1>
<form {onsubmit}>
  <label>
    {m['add_job.job_title.value']()}
    <input type="text" bind:value={$form.title} class:error={$form.errors.title} />
    <div class="form-error">{$form.errors.title}</div>
  </label>
  <AddressInput bind:selected={$form.location} />
  <div class="form-error">{$form.errors.location}</div>
  <DateRangeField bind:value={selectedRange} title={m['add_job.date.title']()} startName="jobStart" endName="jobEnds" />
  <div class="form-error">{$form.errors.startDate}</div>
  <button type="submit">{m['add_job.submit_button']()}</button>
</form>

<style>
form {
  display: flex;
  flex-direction: column;
}
</style>
