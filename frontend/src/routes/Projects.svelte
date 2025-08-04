<script lang="ts">
  import { searchParams } from 'sv-router'
  import { onMount } from 'svelte'

  import Fab from '$lib/components/Fab.svelte'
  import JobCreationFab from '$lib/components/JobCreationFab.svelte'
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
      <div class="loading-state">
        <IconLineMdLoadingTwotoneLoop />
      </div>
    {:else if projects.items.length === 0}
      <div class="empty-state">
        <div class="empty-state-icon">
          <IconPhClipboardText />
        </div>
        <h3>No projects yet</h3>
        <p>You haven't created any jobs yet. Tap the + button to get started.</p>
      </div>
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
    /* Use app background to create contrast with white cards */
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

  /* Loading state */
  .loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .loading-state :global(svg) {
    width: 32px;
    height: 32px;
    color: var(--color-primary);
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: var(--space-8) var(--space-4);
    margin-top: var(--space-8);
    background: var(--color-background-screen);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-default);
  }

  .empty-state-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: var(--color-background-elevated);
    border-radius: var(--radius-full);
    margin-bottom: var(--space-6);
  }

  .empty-state-icon :global(svg) {
    width: 28px;
    height: 28px;
    color: var(--color-text-tertiary);
  }

  .empty-state h3 {
    font-size: var(--font-size-heading);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-3) 0;
  }

  .empty-state p {
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    line-height: var(--line-height-loose);
    margin: 0;
    max-width: 280px;
    margin-inline: auto;
  }

  /* Projects list */
  .projects-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .empty-state-icon {
      border: 2px solid var(--color-border-strong);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .loading-state :global(svg) {
      animation: none;
    }
  }
</style>
