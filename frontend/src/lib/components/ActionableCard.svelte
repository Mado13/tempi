<script lang="ts">
  import type { Snippet } from 'svelte'

  import { highlightCard } from '$lib/actions/highlight-card.svelte.js'

  interface Props {
    children: Snippet
    href: string
    isHighlighted: boolean
  }

  let { href, children, isHighlighted, ...restProps }: Props = $props()
</script>

<a
  {href}
  {...restProps}
  use:highlightCard={{
    isHighlighted,
    duration: 1400,
    shimmerDuration: 800,
  }}>
  {@render children()}
</a>

<style>
  a {
    /* Reset link styles */
    text-decoration: none;
    color: inherit;

    /* Card base styles from design system */
    display: flex;
    flex-direction: column;
    padding: var(--space-6);
    background: var(--color-background-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-subtle);

    /* Mobile touch optimizations */
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    user-select: none;
    /* Mobile-optimized cursor */
    cursor: default;

    /* Performance optimizations */
    contain: layout paint style;
    transform-origin: center;
    will-change: transform, box-shadow, border-color;

    /* Smooth transitions */
    transition:
      transform var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out),
      opacity var(--duration-fast) var(--ease-out);

    &:active {
      transform: scale(0.997);
      transition-duration: var(--duration-instant);
    }

    &:focus-visible {
      outline: none;
      border-color: var(--color-border-focused);
      box-shadow: var(--ring), var(--shadow-elevated);
    }
  }
</style>
