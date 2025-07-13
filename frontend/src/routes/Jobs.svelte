<script lang="ts">
  import { p, route } from '$router'

  import BottomSheet from '$lib/components/BottomSheet.svelte'
  import Fab from '$lib/components/Fab.svelte'

  const role = route.params.role
  let showNewJobModal = $state(false)

  function handleAddJob() {
    showNewJobModal = true
  }
</script>

<div>
  {#if role === 'employer'}
    <h1>Employer cards</h1>
    <Fab href={p('/app/:role/jobs/new', { role })}><IconPhPlusSquare /></Fab>
    <BottomSheet bind:open={showNewJobModal} title="New Job">
      <h1>Form</h1>
    </BottomSheet>
  {:else}
    <h1>Worker cards</h1>
  {/if}
</div>

<style>
  div {
    position: relative;
    min-height: 100vh;
    padding: var(--spacing-m);
  }
</style>
