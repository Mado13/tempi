<script lang="ts">
  import { highlightCard } from '$lib/actions/highlight-card.svelte'
  import StatusBadge from '$lib/components/StatusBadge.svelte'
  import type { Project } from '$lib/schemas/project.schema.svelte'
  import { formatHebrewDateRangeFromStrings } from '$lib/utils/dates'

  interface Props {
    project: Project
    isNewlyCreated?: boolean
  }

  let { project, isNewlyCreated = false }: Props = $props()

  const dateRange = formatHebrewDateRangeFromStrings(project.date.start, project.date.end)
</script>

<article
  class="card"
  class:job-card-featured={isNewlyCreated}
  use:highlightCard={{
    isHighlighted: isNewlyCreated,
    duration: 1400,
    shimmerDuration: 800,
  }}>
  <header>
    <h3>{project.name}</h3>
    <StatusBadge status={project.status} />
  </header>

  <ul>
    <li>
      <IconPhMapPinLine />
      <span>{project.address.formattedAddress}</span>
    </li>
    <li>
      <IconPhCalendar />
      <span>{dateRange}</span>
    </li>
    <li>
      <IconPhUsers />
      <span>2/4</span>
    </li>
  </ul>

  <footer>
    <div>
      <span class="text-caption">5 applications</span>
      <span class="text-caption">{project.favoritesCount} Saved</span>
    </div>
  </footer>
</article>

<style>
  article {
    padding: var(--space-6);
    background: var(--color-background-screen);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    container-type: inline-size;
    container-name: job-card;
    touch-action: manipulation;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-height: 150px;
    touch-action: pan-y;
    transform-origin: center;
    contain: layout paint style;

    &:active {
      transform: scale(0.997);
      transition: transform var(--duration-instant) var(--ease-out);
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-4);

      > h3 {
        font-size: var(--font-size-heading);
        font-weight: var(--font-weight-semibold);
        line-height: var(--line-height-normal);
        margin: 0;
        flex: 1;
      }
    }
  }

  /* Project details list */
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    :global(svg) {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: var(--color-text-tertiary);
    }

    > li {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-secondary);
      font-size: var(--font-size-caption);
    }
  }

  /* Footer spacing */
  footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    > div {
      flex-wrap: wrap;
      display: flex;
      gap: var(--space-4);
    }
  }

  /* Hover only on hover-capable devices */
  @media (hover: hover) and (pointer: fine) {
    .card {
      transition:
        box-shadow var(--duration-fast) var(--ease-out),
        border-color var(--duration-fast) var(--ease-out);
    }

    .card:hover {
      border-color: var(--color-border-strong);
      box-shadow: var(--shadow-elevated);
    }
  }
</style>
