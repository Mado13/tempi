<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  export interface ButtonProps extends HTMLButtonAttributes {
    children: Snippet
    loading?: boolean
  }
  let {
    children,
    loading = false,
    disabled = false,
    type = 'button',
    ...restProps
  }: ButtonProps = $props()
</script>

<!--
  @component Button
  
  A flexible button component with CSS custom property theming.
  @example
  ```svelte
  <Button --bg-color="red" --color="white">
    Click me
  </Button>
  
  @css-props
  - `--bg-color` - Background color
  - `--color` - Text color  
  - `--border` - Border style
  - `--active-bg-color` - Active state background
  - `--active-color` - Active state text color
  - `--disabled-bg-color` - Disabled state background
  - `--disabled-border-color` - Disabled state border color
  - `--text-align` - Text alignment (center, left, right)
  - `--justify-content` - Content justification (center, flex-start, flex-end, space-between)
  - `--font-weight` - Font weight
  - `--font-size` - Font size
  - `--padding` - Button padding
  - `--spinner-border` - Spinner border style for loading state
-->
<button {type} {...restProps} disabled={disabled || loading} class:loading>
  {#if loading}
    <span class="spinner"></span>
  {:else}
    {@render children()}
  {/if}
</button>

<style>
  button {
    display: flex;
    align-items: center;
    justify-content: var(--justify-content, center);
    background-color: var(--bg-color);
    width: 100%;
    color: var(--color);
    border: var(--border);
    min-height: var(--min-height, var(--tap-min));
    padding: var(--padding, 0 var(--space-6));
    border-radius: var(--border-radius, var(--radius-xl));
    font-family: var(--font-family-app);
    font-size: var(--font-size, var(--font-size-body));
    font-weight: var(--font-weight, var(--font-weight-medium));
    text-align: var(--text-align, center);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    white-space: nowrap;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out),
      transform var(--duration-instant) var(--ease-out),
      opacity var(--duration-instant) var(--ease-out);
  }

  button:active:not(:disabled) {
    background: var(--active-bg-color, var(--color-primary-active));
    color: var(--active-color);
    transform: scale(0.95);
    opacity: 0.9;
  }

  button:disabled {
    background: var(--disabled-bg-color, var(--color-background-elevated));
    border-color: var(--disabled-border-color, var(--color-border-default));
    color: var(--disabled-color, var(--color-text-tertiary));
    cursor: not-allowed;
    transform: none;
    opacity: 0.7;
  }

  .spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: var(--spinner-border, 2px solid var(--color, currentColor));
    border-top-color: transparent;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
