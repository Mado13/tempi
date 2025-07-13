<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
</script>

<div>
  <div>
    {@render children()}
  </div>
</div>

<style>
  div {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    background-color: var(--color-background-page);
    padding-top: var(--safe-area-top);
    padding-bottom: var(--safe-area-bottom);
    overflow: hidden;

    > div {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: var(--spacing-l) var(--spacing-m);
      padding-bottom: calc(var(--spacing-xxl) + var(--safe-area-bottom));
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;

      :global(header) {
        margin-bottom: var(--spacing-xl);
        text-align: center;
      }
    }
  }

  :global(.auth-helper-text) {
    font-size: var(--font-size-label-s);
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-top: var(--spacing-xs);
  }

  :global(.auth-error) {
    font-size: var(--font-size-label-s);
    color: var(--color-semantic-error-fg);
    line-height: 1.5;
    margin-top: var(--spacing-xs);
  }
</style>
