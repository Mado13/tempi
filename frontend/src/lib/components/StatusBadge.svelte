<script lang="ts">
  let { status } = $props()
</script>

<span data-status={status}>
  {status}
</span>

<style>
  span {
    flex-shrink: 0;
    padding-inline: var(--space-3);
    padding-block: var(--space-1);
    border-radius: var(--radius-full);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    &[data-status='published'] {
      background-color: rgba(var(--primary-rgb), 0.1);
      color: var(--color-primary);
    }
    &[data-status='filled'],
    &[data-status='finished'] {
      background-color: rgba(16, 185, 129, 0.1); /* Success alpha */
      color: var(--color-success);
    }
    &[data-status='canceled'] {
      background-color: var(--color-background-elevated);
      color: var(--color-text-tertiary);
    }
  }
</style>
