<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  interface ActionableCardProps extends HTMLAttributes<HTMLElement> {
    children: Snippet
    href: string
    ariaLabel?: string
  }

  let { children, href, ariaLabel = 'View details', ...restProps }: ActionableCardProps = $props()
</script>

<!--
  @component ActionableCard
  
  A card component that navigates when clicked using stretched link pattern.
  Interactive elements inside (buttons, links) automatically have higher z-index.
  
  @example
  ```svelte
  <ActionableCard href="/opportunity/123" ariaLabel="View job opportunity">
    <h3>Job Title</h3>
    <p>Description...</p>
    <button onclick={() => favorite()}>❤️</button>
  </ActionableCard>
  ```
-->

<article {...restProps}>
  <a {href} class="stretched-link" aria-label={ariaLabel}></a>
  {@render children()}
</article>

<style>
  article {
    background: var(--color-background-elevated);
    border: 1px solid var(--color-border-elevated);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-subtle);
    padding: var(--space-6);
    transition: transform var(--duration-fast) var(--ease-out);
    position: relative;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    &:active {
      transform: translateY(1px);
      box-shadow: var(--shadow-border);
    }
    > a {
      position: absolute;
      inset: 0;
      z-index: 0;
      border-radius: var(--radius-lg);
    }
  }

  /* Automatically elevate interactive elements */
  article :global(button),
  article :global(a:not(.stretched-link)),
  article :global(input),
  article :global(select),
  article :global(textarea) {
    position: relative;
    z-index: 1;
  }
</style>
