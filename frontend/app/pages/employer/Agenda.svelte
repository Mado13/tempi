<!-- Agenda.svelte -->

<script lang="ts">
import { router } from '@inertiajs/svelte'
import { getLocalTimeZone, today } from '@internationalized/date'
import { watch } from 'runed'

import JobCard from '$components/employer/JobCard.svelte'
import Button from '$components/ui/Button.svelte'
import Calendar from '$components/ui/Calendar.svelte'

import { m } from '$i18n/paraglide/messages'

let { jobs } = $props()

let selectedDate = $state(today(getLocalTimeZone()))
let displayedMonth = $state(today(getLocalTimeZone()))

watch(
  () => displayedMonth,
  (curr, prev) => {
    if (curr.month !== prev?.month) {
      router.reload({
        only: ['jobs'],
        data: {
          month: displayedMonth.month,
          year: displayedMonth.year,
        },
      })
    }
  },
  { lazy: true },
)

async function addJob() {
  router.push({
    url: '/employer/jobs/new',
    component: 'employer/AddJob',
    props: curr => ({ selectedDate, ...curr }),
  })
}
</script>

<Calendar bind:value={selectedDate} bind:placeholder={displayedMonth} />
<Button onclick={() => addJob()}><IconTablerHexagonPlusFilled /></Button>
{#if jobs.length > 0}
  {#each jobs as job (job.id)}
    <JobCard {job} />
  {/each}
{:else}
  <div>{m['agenda.employer.no_planned_jobs']()}</div>
{/if}
