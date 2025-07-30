<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  interface Props extends HTMLButtonAttributes {
    children: Snippet
    'aria-label': string
  }

  let { children, ...restProps }: Props = $props()
</script>

<button {...restProps}>
  {@render children()}
</button>

<style>
  button {
    display: grid;
    place-content: center;
    width: var(--size-tap-target);
    height: var(--size-tap-target);
    border-radius: var(--radius-full);
    color: var(--color-text-secondary);
    font-size: 1.5rem;
    transition:
      background-color var(--transition-fast),
      color var(--transition-fast);
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
</style>
