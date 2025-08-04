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
    bottom: calc(var(--bottom-nav-height) + var(--safe-bottom) + var(--space-4));
    right: var(--space-4);
    width: var(--tap-large);
    height: var(--tap-large);
    border-radius: var(--radius-full);
    background-color: var(--color-primary);
    color: var(--color-text-on-primary);
    border: none;
    box-shadow: var(--shadow-floating);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    z-index: 1000;
    text-decoration: none;
    font-family: var(--font-family-app);
    font-weight: var(--font-weight-medium);
    will-change: transform;
    transform: translateZ(0); /* GPU layer hint */
    backface-visibility: hidden;
  }

  button:active,
  a:active {
    transform: scale(0.95);
    background-color: var(--color-primary-active);
    box-shadow: var(--shadow-elevated);
  }

  button:hover,
  a:hover {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  button:focus-visible,
  a:focus-visible {
    outline: none;
    box-shadow: var(--ring), var(--shadow-floating);
  }

  button:disabled {
    background-color: var(--color-text-tertiary);
    cursor: not-allowed;
    transform: none;
  }

  button:disabled:active {
    transform: none;
    background-color: var(--color-text-tertiary);
  }

  /* Icon styling */
  button :global(svg),
  a :global(svg) {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    fill: currentColor;
    stroke: currentColor;
  }

  /* Platform-specific optimizations */
  .platform-android button,
  .platform-android a {
    box-shadow: var(--shadow-elevated);
  }

  .platform-android button:active,
  .platform-android a:active {
    box-shadow: var(--shadow-subtle);
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    button,
    a {
      transition: none;
    }

    button:hover,
    a:hover {
      transform: none;
    }

    button:active,
    a:active {
      transform: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    button,
    a {
      border: 2px solid var(--color-text-primary);
    }
  }
</style>
