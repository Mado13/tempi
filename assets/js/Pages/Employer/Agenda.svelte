<!-- Agenda.svelte -->

<script lang="ts">
import { router } from '@inertiajs/svelte'
import { getLocalTimeZone, today } from '@internationalized/date'
import Calendar from '../../Components/Calendar.svelte'
import Button from '../../Components/UI/Button.svelte'

let { jobs } = $props()

let selectedDate = $state(today(getLocalTimeZone()))
let displayedMonth = $state(today(getLocalTimeZone()))
let month = $derived(displayedMonth.month)
let year = $derived(displayedMonth.year)

$effect(() => {
  router.reload({
    only: ['jobs'],
    data: {
      month,
      year,
    },
  })
})

async function addJob() {
  router.push({
    url: '/employer/jobs/new',
    component: 'Employer/AddJob',
    props: curr => ({ selectedDate, ...curr }),
  })
}
</script>

<Calendar bind:value={selectedDate} bind:placeholder={displayedMonth} />
<Button onclick={() => addJob()}><IconTablerHexagonPlusFilled /></Button>
{#if jobs.length > 0}
  {#each jobs as job (job.id)}
    <div>{job.title}</div>
  {/each}
{:else}
  <div>You dont have anything plan for this date...</div>
{/if}
