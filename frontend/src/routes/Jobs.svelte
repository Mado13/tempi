<script lang="ts">
  import { route } from '$router'
  import { searchParams } from 'sv-router'
  import { onMount } from 'svelte'

  import Fab from '$lib/components/Fab.svelte'
  import JobCard from '$lib/components/JobCard.svelte'
  import JobCreationFab from '$lib/components/JobCreationFab.svelte'
  import { useCompaniesStore } from '$lib/stores/resources/companies.store.svelte'
  import { useJobsStore } from '$lib/stores/resources/jobs.store.svelte'

  const role = $derived(route.params.role as 'worker' | 'employer')
  const highlightId = $derived(searchParams.get('highlight'))

  const jobs = useJobsStore()
  const companies = useCompaniesStore()

  onMount(async () => {
    companies.init()
    jobs.init({ paginate: true })
  })
</script>

<div>
  <header><h1>Jobs</h1></header>
  <div>
    {#if jobs.isLoading}
      <p>Loading jobs...</p>
    {:else if jobs.items.length === 0}
      <p>You haven't created any jobs yet.</p>
    {:else}
      {#each jobs.items as job (job.id)}
        <JobCard {job} isNewlyCreated={job.id === highlightId} />
      {/each}
    {/if}

    {#if role === 'employer'}
      <JobCreationFab {role}>
        {#snippet children(props)}
          <Fab {...props}>
            <IconPhPlusSquare />
          </Fab>
        {/snippet}
      </JobCreationFab>
    {/if}
  </div>
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-m);
    gap: var(--spacing-l);
  }
  div > div {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
  }
</style>
