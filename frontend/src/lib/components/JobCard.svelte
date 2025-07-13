<script lang="ts">
  import { route } from '$router'
  import type { Snippet } from 'svelte'

  import { dismissable } from '$lib/actions/gestures'
  import CardButton from '$lib/components/CardButton.svelte'
  import EmployerCardMenu from '$lib/components/EmployerCardMenu.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import WorkerCardMenu from '$lib/components/WorkerCardMenu.svelte'
  import type { Job } from '$lib/schemas/job.scehma'

  const role = $derived(route.params.role as string)

  let { job, onmenuopen }: { job: Job; onmenuopen: (menuSnippet: Snippet) => void } = $props()
</script>

<article
  class="card"
  data-role={role}
  use:dismissable={{
    enabled: role === 'worker',
    axis: 'x',
    onDismiss: () => console.log('bye'),
    lockDirection: false,
  }}>
  <header>
    {#if role === 'employer'}
      <h3>Role or Skill</h3>
      <span>Job Status</span>
    {:else if role === 'worker'}
      <a>
        <img />
        <div>
          <strong>Company Name</strong>
          <span>Job location</span>
        </div>
      </a>
      <CardButton aria-label="Save to favorites">
        <IconPhHeart />
      </CardButton>
    {/if}
  </header>

  {#if role === 'employer'}
    <ul class="details-list">
      <li>Where:</li>
      <li>When:</li>
      <li>2 / 4 Filled</li>
    </ul>
  {:else if role === 'worker'}
    <div class="job-details">
      <h3>Role or Skill</h3>
      <p>Salary</p>
    </div>
  {/if}

  <footer>
    {#if role === 'employer'}
      <div>
        <span>5 applications</span>
        <span>15 Saved</span>
      </div>
    {:else if role === 'worker'}
      <div class="tags">
        <span>Boob</span>
      </div>
      <div class="actions">
        <PrimaryButton>Apply now</PrimaryButton>
      </div>
    {/if}

    <CardButton onclick={() => onmenuopen(menuContent)} aria-label="More options">
      &#x22EE;
    </CardButton>
  </footer>

  {#snippet menuContent()}{#if role === 'employer'}
      <EmployerCardMenu {job} />
    {:else}
      <WorkerCardMenu />
    {/if}{/snippet}
</article>

<style>
  article {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    min-height: 150px;
    touch-action: none;

    header,
    footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-s);
    }

    footer {
      margin-top: auto;
      align-items: center;
    }

    h3 {
      margin: 0;
      font-size: var(--font-size-headline-s);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      line-height: 1.3;
    }
  }

  article[data-role='employer'] {
    header span {
      flex-shrink: 0;
      padding: var(--spacing-xs) var(--spacing-s);
      border-radius: var(--radius-full);
      font-size: var(--font-size-label-s);
      font-weight: var(--font-weight-medium);
      /* ... data-status attributes will handle colors ... */
    }

    .details-list {
      list-style: none;
      margin: 0;
      padding: 0;
      font-size: var(--font-size-label-m);
      color: var(--color-text-secondary);

      li {
        margin-bottom: var(--spacing-xs);
      }
    }

    footer div {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-m);

      span {
        font-size: var(--font-size-label-s);
        color: var(--color-text-secondary);
      }
    }
  }

  article[data-role='worker'] {
    header {
      a {
        display: flex;
        align-items: center;
        gap: var(--spacing-m);
        text-decoration: none;
        color: var(--color-text-primary);

        img {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-m);
          background-color: var(--color-background-page);
        }

        div {
          text-align: right; /* RTL */
          strong {
            display: block;
            font-weight: var(--font-weight-semibold);
          }
          span {
            font-size: var(--font-size-label-m);
            color: var(--color-text-secondary);
          }
        }
      }
    }

    .job-details {
      text-align: right;
      p {
        margin: 0;
        font-weight: var(--font-weight-medium);
      }
    }

    footer {
      align-items: flex-end;

      .tags {
        span {
          padding: var(--spacing-xs) var(--spacing-s);
          background-color: var(--color-background-page);
          color: var(--color-text-secondary);
          border-radius: var(--radius-full);
          font-size: var(--font-size-label-s);
        }
      }

      .actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-s);
      }
    }

    footer .actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-s);
    }
  }
</style>
