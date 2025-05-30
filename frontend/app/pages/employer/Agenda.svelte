<!-- Agenda.svelte -->
<script lang="ts">
import { router } from '@inertiajs/svelte'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { resource } from 'runed'

import JobCard from '$components/employer/JobCard.svelte'
import Button from '$components/ui/Button.svelte'
import Calendar from '$components/ui/Calendar.svelte'

import { m } from '$i18n/paraglide/messages'

let { jobs } = $props()
let selectedDate = $state(today(getLocalTimeZone()))
let displayedMonth = $state(today(getLocalTimeZone()))

let filteredJobs = $derived.by(() => {
  return jobs.filter(job => {
    // Parse UTC strings to CalendarDate (just the date part)
    const startDate = job.startDate ? parseDate(job.startDate.split('T')[0]) : null
    const endDate = job.endDate ? parseDate(job.endDate.split('T')[0]) : null

    // Handle missing dates
    if (!startDate && !endDate) return false
    if (!startDate) return endDate && selectedDate.compare(endDate) <= 0
    if (!endDate) return startDate && selectedDate.compare(startDate) >= 0

    // Both dates exist - check if selectedDate falls within the range
    return selectedDate.compare(startDate) >= 0 && selectedDate.compare(endDate) <= 0
  })
})

resource(
  () => [displayedMonth.month, displayedMonth.year],
  async ([month, year]) => {
    return router.reload({
      only: ['jobs'],
      data: { month, year },
    })
  },
  { lazy: true, debounce: 150 },
)

async function addJob() {
  router.push({
    url: '/employer/jobs/new',
    component: 'employer/AddJob',
    props: curr => ({ selectedDate, ...curr }),
  })
}
</script>

<div class="calendar-section">
  <Calendar bind:value={selectedDate} bind:placeholder={displayedMonth} />
  <Button onclick={() => addJob()}><IconTablerHexagonPlusFilled /></Button>
</div>

<div class="events-section">
  {#if filteredJobs.length > 0}
    <div class="jobs-list">
      {#each filteredJobs as job (job.id)}
        <JobCard {job} />
      {/each}
    </div>
  {:else}
    <div class="no-jobs">{m['agenda.employer.no_planned_jobs']()}</div>
  {/if}
</div>

<style lang="scss">
.calendar-section {
  flex-shrink: 0;
}

.events-section {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
