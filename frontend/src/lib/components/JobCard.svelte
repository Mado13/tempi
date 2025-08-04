<script lang="ts">
  import { route } from '$router'
  import { Toggle } from 'melt/builders'
  import { onDestroy } from 'svelte'

  import { dismissable } from '$lib/actions/gestures'
  import { api } from '$lib/api'
  import CardButton from '$lib/components/CardButton.svelte'
  import EmployerCardMenu from '$lib/components/EmployerCardMenu.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import WorkerCardMenu from '$lib/components/WorkerCardMenu.svelte'
  import * as bottomSheet from '$lib/services/bottomsheet.service.svelte'
  import { getClassificationById } from '$lib/services/job-classification.service'
  import { getStorageServices } from '$lib/services/storage'
  import type { Job } from '$lib/stores/resources/jobs.store.svelte'
  import { formatHebrewDateRangeFromStrings } from '$lib/utils/dates'

  const storageServices = getStorageServices()

  interface Props {
    job: Job
  }
  let { job }: Props = $props()

  const role = $derived(route.params.role as string)
  const dateRange = formatHebrewDateRangeFromStrings(job.date.start, job.date.end)

  const baseSize = 40
  // free plan: no transform; request original and let browser scale

  let logoUrl = $state('') // blob: URL
  let blobHandle: string | null = null
  let lastSig = ''
  let reqId = 0

  function revokeBlob() {
    if (blobHandle) {
      URL.revokeObjectURL(blobHandle)
      blobHandle = null
    }
  }

  // fetch once per (key)
  $effect(() => {
    if (role !== 'worker') {
      revokeBlob()
      logoUrl = ''
      lastSig = ''
      return
    }
    const key = job.company?.logoKey
    if (!key) {
      revokeBlob()
      logoUrl = ''
      lastSig = ''
      return
    }

    const sig = key
    if (sig === lastSig) return
    lastSig = sig

    const my = ++reqId
    ;(async () => {
      try {
        const blob = await storageServices.files.logos.download(key) // no transform on free plan
        if (my !== reqId) return
        revokeBlob()
        blobHandle = URL.createObjectURL(blob)
        logoUrl = blobHandle
      } catch {
        if (my !== reqId) return
        revokeBlob()
        logoUrl = ''
      }
    })()
  })

  onDestroy(revokeBlob)

  const toggle = new Toggle({
    onValueChange: () => {
      api.patch(`/jobs/${job.id}/favorite`)
    },
  })
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
      {#each Object.values(job.jobClassifications) as classification}
        {@const jobClass = getClassificationById(classification)}
        {jobClass?.label}
      {/each}
      <span data-status={job.status}>{job.status}</span>
    {:else if role === 'worker'}
      <a>
        {#if logoUrl}
          <img
            src={logoUrl}
            alt="Company logo"
            width={baseSize}
            height={baseSize}
            loading="lazy"
            decoding="async" />
        {:else}
          <div
            style="
              width: {baseSize}px;
              height: {baseSize}px;
              border-radius: var(--radius-m);
              background: var(--color-background-page);
            " />
        {/if}
        <div>
          <strong>{job.company?.name ?? 'Company'}</strong>
          <span>{job.address}</span>
        </div>
      </a>
      <CardButton {...toggle.trigger} aria-label="toggle favourite">
        {#if toggle.value}
          <IconPhHeartFill />
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
      <h3>Role or Skill</h3>
      <p>Salary</p>
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
