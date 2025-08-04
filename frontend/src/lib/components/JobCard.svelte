<script lang="ts">
  import { route } from '$router'
  import { Toggle } from 'melt/builders'

  import { dismissable } from '$lib/actions/gestures'
  import { highlightCard } from '$lib/actions/highlight-card.svelte'
  import { api } from '$lib/api'
  import CardButton from '$lib/components/CardButton.svelte'
  import CardCompanyLogo from '$lib/components/CardCompanyLogo.svelte'
  import EmployerCardMenu from '$lib/components/EmployerCardMenu.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import WorkerCardMenu from '$lib/components/WorkerCardMenu.svelte'
  import * as bottomSheet from '$lib/services/bottomsheet.service.svelte'
  import { getClassificationById } from '$lib/services/job-classification.service'
  import type { Job } from '$lib/stores/resources/jobs.store.svelte'
  import { formatHebrewDateRangeFromStrings } from '$lib/utils/dates'

  interface Props {
    job: Job
    isNewlyCreated?: boolean
  }
  let { job, isNewlyCreated = false }: Props = $props()

  const role = $derived(route.params.role as string)
  const dateRange = formatHebrewDateRangeFromStrings(job.date.start, job.date.end)

  const baseSize = 40
  const logoUrl = $derived(job.company?.logoUrl ?? '')

  const toggle = new Toggle({
    onValueChange: () => {
      api.patch(`/jobs/${job.id}/favorite`)
    },
  })

  $inspect(job)
</script>

<article
  class="card"
  data-role={role}
  use:highlightCard={{
    isHighlighted: isNewlyCreated,
    duration: 1400,
    shimmerDuration: 800,
  }}
  use:dismissable={{
    enabled: role === 'worker',
    axis: 'x',
    onDismiss: () => console.log('bye'),
    lockDirection: false,
  }}>
  <header>
    {#if role === 'employer'}
      {#each Object.values(job.jobClassifications) as classification}
        {@const jobClass = getClassificationById(classification)}
        {jobClass?.label}
      {/each}
      <span data-status={job.status}>{job.status}</span>
    {:else if role === 'worker'}
      <a href="#">
        <CardCompanyLogo {logoUrl} companyName={job.company?.name} size={baseSize} />
        <div>
          <strong>{job.company?.name}</strong>
        </div>
      </a>
      <CardButton {...toggle.trigger} aria-label="toggle favourite">
        {#if toggle.value}
          <IconPhHeartFill color="var(--color-semantic-error-fg)" />
        {:else}
          <IconPhHeart />
        {/if}
      </CardButton>
    {/if}
  </header>

  {#if role === 'employer'}
    <ul class="details-list">
      <li><IconPhMapPinLine />{job.address.formattedAddress}</li>
      <li><IconPhCalendar />{dateRange}</li>
      <li><IconPhUsers />2/4</li>
    </ul>
  {:else if role === 'worker'}
    <div class="job-details">
      <h3>
        {#each Object.values(job.jobClassifications) as classification}
          {@const jobClass = getClassificationById(classification)}
          {jobClass?.label}
        {/each}
      </h3>
      <div>
        <span>{job.payment.rate}</span>
        {#if job.payment.rateType === 'daily'}
          <div>Daily</div>
        {:else}
          <span>Hourly</span>
        {/if}
      </div>
    </div>
  {/if}

  <footer>
    {#if role === 'employer'}
      <div>
        <span>5 applications</span>
        <span>{job.favoritesCount} Saved</span>
      </div>
    {:else if role === 'worker'}
      <div class="tags"><span>Boob</span></div>
      <div class="actions"><PrimaryButton>Apply now</PrimaryButton></div>
    {/if}

    <CardButton
      onclick={() => bottomSheet.show({ id: 'job-card-sheet', content: menuContent })}
      aria-label="More options">
      &#x22EE;
    </CardButton>
  </footer>

  {#snippet menuContent()}
    {#if role === 'employer'}
      <EmployerCardMenu {job} />
    {:else}
      <WorkerCardMenu />
    {/if}
  {/snippet}
</article>

<style>
  article {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    min-height: 150px;
    touch-action: pan-y;
    will-change: transform;
    transform-origin: center;
    backface-visibility: hidden;

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
      &[data-status='open'] {
        background-color: var(--color-semantic-info-bg);
        color: var(--color-semantic-info-fg);
      }
      &[data-status='filled'],
      &[data-status='finished'] {
        background-color: var(--color-semantic-success-bg);
        color: var(--color-semantic-success-fg);
      }
      &[data-status='canceled'] {
        background-color: var(--color-border-default);
        color: var(--color-text-secondary);
      }
    }

    .details-list {
      list-style: none;
      margin: 0;
      padding: 0;
      font-size: var(--font-size-label-m);
      color: var(--color-text-secondary);

      li {
        display: flex;
        gap: var(--spacing-s);
        align-items: center;
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
