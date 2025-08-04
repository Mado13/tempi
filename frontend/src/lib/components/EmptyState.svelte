<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    icon: Snippet
    resource: string
    description: string
  }
  let { icon, resource, description }: Props = $props()
</script>

<div>
  <div>
    {@render icon()}
  </div>
  <h3>No {resource} yet</h3>
  {#if description}
    <p>{description}</p>
  {/if}
</div>

<style>
  div {
    text-align: center;
    padding: var(--space-8) var(--space-4);
    margin-top: var(--space-8);
    background: var(--color-background-screen);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-default);

    > div {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: var(--color-background-elevated);
      border-radius: var(--radius-full);
      margin-bottom: var(--space-6);

      :global(svg) {
        width: 28px;
        height: 28px;
        color: var(--color-text-tertiary);
      }

      @media (prefers-contrast: high) {
        border: 2px solid var(--color-border-strong);
      }
    }

    > h3 {
      font-size: var(--font-size-heading);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-3) 0;
    }

    > p {
      font-size: var(--font-size-body);
      color: var(--color-text-secondary);
      line-height: var(--line-height-loose);
      margin: 0;
      max-width: 280px;
      margin-inline: auto;
    }
  }
</style>
