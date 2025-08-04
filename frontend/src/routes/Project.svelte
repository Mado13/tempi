<script lang="ts">
  import { route } from '$router'
  import { onMount } from 'svelte'

  import { api } from '$lib/api'
  import ApplicantCard from '$lib/components/ApplicantCard.svelte'
  import SegmentedControl from '$lib/components/SegmentedControl.svelte'
  import StatusBadge from '$lib/components/StatusBadge.svelte'
  import type { Project } from '$lib/schemas/project.schema.svelte'
  import { useProjectsStore } from '$lib/stores/resources/projects.store.svelte'
  import { useWorkerProfileStore } from '$lib/stores/resources/worker-profiles.store.svelte'
  import { formatHebrewDateRangeFromStrings } from '$lib/utils/dates'

  const projectsStore = useProjectsStore()
  const { projectId } = route.getParams('/app/employer/projects/:projectId')
  let project = $state<Project | undefined>(undefined)
  const projectApplicants = useWorkerProfileStore(projectId)()

  onMount(async () => {
    projectApplicants.init()
    if (projectsStore.isInitialized) {
      project = projectsStore.getById(projectId)
    } else {
      const res = await api.get(`/projects/${projectId}`)
      project = res.data
    }
  })

  const tabs = $derived([
    { id: 'roster', label: 'Roster', content: rosterContent },
    { id: 'applications', label: 'Applications', content: applicationsContent },
    { id: 'updates', label: 'Updates', content: updatesContent },
  ])
</script>

{#snippet rosterContent()}
  <span>Roster</span>
{/snippet}

{#snippet applicationsContent()}
  {#each projectApplicants.items as applicant}
    <ApplicantCard applicantName={applicant.fullName} />
  {/each}
{/snippet}

{#snippet updatesContent()}
  <span>Updates</span>
{/snippet}

<div class="header">
  <h1>{project?.name}</h1>
  <div class="address">
    {project?.address.formattedAddress}
  </div>
  <div class="meta">
    <div class="meta-row">
      <div class="meta-item">
        <span class="meta-value">
          {formatHebrewDateRangeFromStrings(project?.date.start, project?.date.end)}
        </span>
      </div>
      <div class="meta-item">
        <StatusBadge status={project?.status} />
      </div>
    </div>

    <div class="meta-row">
      <div class="meta-item">
        <div class="seats-progress">
          <div class="progress-header">
            <span class="progress-count">8 of 12 positions filled</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 67%"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="project-notes">
    <div class="notes-label">Project Notes</div>
    <p class="notes-content">
      {project?.notes}
    </p>
  </div>
</div>

<div class="content">
  <SegmentedControl {tabs} />
</div>

<style>
  .header {
    background: var(--color-background-screen);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    margin: var(--space-4) var(--space-4) var(--space-4) var(--space-4);
    box-shadow: var(--shadow-subtle);

    h1 {
      font-size: var(--font-size-title);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-tight);
      margin: 0 0 var(--space-5) 0;
      color: var(--color-text-primary);
    }

    .address {
      font-size: var(--font-size-caption);
      color: var(--color-text-secondary);
      line-height: var(--line-height-normal);
      margin-bottom: var(--space-6);
    }

    .meta {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
  }

  .content {
    padding: 0 var(--space-4);
  }

  .meta-value {
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .seats-progress {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .progress-count {
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary);
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(139, 92, 246, 0.1);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--color-primary);
    border-radius: var(--radius-full);
    transition: width var(--duration-normal) var(--ease-out);
  }

  .project-notes {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border-default);
  }

  .notes-label {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-2);
  }

  .notes-content {
    font-size: var(--font-size-body);
    line-height: var(--line-height-normal);
    color: var(--color-text-secondary);
    margin: 0;
  }
</style>
