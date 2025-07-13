<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    children,
    onclick,
    href,
    ...restProps
  }: { children: Snippet; onclick?: (event: MouseEvent) => void; href?: string } = $props()
</script>

{#if href}
  <a {href} {...restProps}>
    {@render children()}
  </a>
{:else}
  <button {onclick} {...restProps}>
    {@render children()}
  </button>
{/if}

<style>
  button,
  a {
    position: fixed;
    bottom: calc(var(--bottom-nav-height) + var(--safe-area-bottom) + var(--spacing-l));
    right: var(--spacing-l);
    width: 56px;
    height: 56px;
    border-radius: var(--radius-full);
    background-color: var(--color-interactive-accent-default);
    color: var(--color-text-on-accent);
    border: none;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    z-index: 1000;

    min-width: var(--size-tap-target);
    min-height: var(--size-tap-target);

    &:active {
      transform: scale(0.95);
      background-color: var(--color-interactive-accent-active);
      box-shadow: var(--shadow-lg-active);
    }

    &:focus-visible {
      outline: 3px solid rgba(108, 98, 208, 0.5);
      outline-offset: 2px;
    }

    svg {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
  }
</style>
