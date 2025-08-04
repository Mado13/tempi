<script lang="ts">
  import { searchParams } from 'sv-router'
  import { onMount } from 'svelte'

  import EmptyState from '$lib/components/EmptyState.svelte'
  import Fab from '$lib/components/Fab.svelte'
  import LoadingState from '$lib/components/LoadingState.svelte'
  import ProjectCard from '$lib/components/ProjectCard.svelte'
  import ProjectCreationFab from '$lib/components/ProjectCreationFab.svelte'
  import { useProjectsStore } from '$lib/stores/resources/projects.store.svelte'

  const projects = useProjectsStore()
  const highlightId = $derived(searchParams.get('highlight'))

  onMount(async () => {
    projects.init()
  })
</script>

<div class="projects-page">
  <header>
    <h1>
      <span><IconPhClipboardText /></span>
      Your projects
    </h1>
    <p>{projects.items.length} active listings</p>
  </header>

  <div class="projects-content">
    {#if projects.isLoading}
      <LoadingState />
    {:else if projects.items.length === 0}
      <EmptyState
        resource="projects"
        description="You haven't created any jobs yet. Tap the + button to get started.">
        {#snippet icon()}
          <IconPhClipboardText />
        {/snippet}
      </EmptyState>
    {:else}
      <div class="projects-list">
        {#each projects.items as project (project.id)}
          <ProjectCard {project} isNewlyCreated={project.id === highlightId} />
        {/each}
      </div>
    {/if}

    <ProjectCreationFab>
      {#snippet children(props)}
        <Fab {...props}>
          <IconPhPlusBold />
        </Fab>
      {/snippet}
    </ProjectCreationFab>
  </div>
</div>

<style>
  .projects-page {
    background: var(--color-background-app);
    padding: var(--space-4);
    padding-bottom: calc(var(--bottom-nav-height) + var(--space-4));
    min-height: 100vh;
  }

  /* Header section */
  header {
    margin-bottom: var(--space-8);
  }

  header h1 {
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin: 0 0 var(--space-2) 0;
    line-height: var(--line-height-tight);
  }

  header span :global(svg) {
    width: 1.25em;
    height: 1.25em;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  header p {
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    margin: 0;
  }

  /* Content area */
  .projects-content {
    flex: 1;
    position: relative;
  }

  /* Projects list */
  .projects-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
</style>
