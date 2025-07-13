<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
</script>

<ul>
  {@render children()}
</ul>

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0 var(--spacing-s);
    display: flex;
    flex-direction: column;

    :global(li button) {
      display: flex;
      align-items: center;
      gap: var(--spacing-m);
      width: 100%;
      padding: var(--spacing-m);
      font-size: var(--font-size-body-r);
      font-weight: var(--font-weight-medium);
      background: none;
      border: none;
      border-radius: var(--radius-m);
      text-align: left;
      color: var(--color-text-primary);
      cursor: pointer;

      &:active {
        background-color: var(--color-background-surface-active);
      }
    }

    :global(li:last-child button) {
      color: var(--color-semantic-error-fg);
    }
  }
</style>
