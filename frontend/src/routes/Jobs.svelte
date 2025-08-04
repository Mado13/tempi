<!-- src/routes/(app)/[role]/jobs/+page.svelte -->
<script lang="ts">
  import { route } from '$router'
  import { onMount } from 'svelte'

  import Fab from '$lib/components/Fab.svelte'
  import JobCard from '$lib/components/JobCard.svelte'
  import JobCreationFab from '$lib/components/JobCreationFab.svelte'
  import { useCompaniesStore } from '$lib/stores/resources/companies.store.svelte'
  import { useJobsStore } from '$lib/stores/resources/jobs.store.svelte'

  const role = $derived(route.params.role as 'worker' | 'employer')

  // role-keyed store instance
  const jobsStore = $derived.by(() => useJobsStore(role))
  const companyStore = useCompaniesStore()

  // init each instance once (no reactive dependency on store internals)
  onMount(async () => {
    await Promise.all([companyStore.init(), jobsStore.init()])
  })

  $inspect(jobsStore)
</script>

<div>
  <header><h1>Jobs</h1></header>
  <div>
    {#if jobsStore.isLoading}
      <p>Loading jobs...</p>
    {:else if jobsStore.items.length === 0}
      <p>You haven't created any jobs yet.</p>
    {:else}
      {#each jobsStore.items as job (job.id)}
        <JobCard {job} />
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
