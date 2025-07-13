<script lang="ts">
  import { p, route } from '$router'
  import type { Snippet } from 'svelte'

  import BottomSheet from '$lib/components/BottomSheet.svelte'
  import Fab from '$lib/components/Fab.svelte'
  import JobCard from '$lib/components/JobCard.svelte'
  import { jobsStoreContext } from '$lib/stores/contexts'

  const jobsStore = jobsStoreContext.get()
  let activeMenuSnippet = $state<Snippet | null>(null)
  let isMenuOpen = $state(false)
  const role = $derived(route.params.role as string)

  function openJobMenu(menuSnippet: Snippet) {
    activeMenuSnippet = menuSnippet
    isMenuOpen = true
  }
</script>

<div>
  {#if jobsStore.isLoading}
    <p>Loading jobs...</p>
  {:else if jobsStore.items.length === 0}
    <p>You haven't created any jobs yet.</p>
  {:else}
    {#each jobsStore.items as job (job.id)}
      <JobCard {job} onmenuopen={openJobMenu} />
    {/each}
  {/if}
  <Fab href={p('/app/:role/job/new', { role })}><IconPhPlusSquare /></Fab>
</div>

<BottomSheet bind:open={isMenuOpen}>
  {#if activeMenuSnippet}
    {@render activeMenuSnippet()}
  {/if}
</BottomSheet>

<style>
  div {
    position: relative;
    min-height: 100vh;
    padding: var(--spacing-m);
  }
</style>
