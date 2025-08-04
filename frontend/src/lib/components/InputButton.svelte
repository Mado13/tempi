<!-- lib/components/InputButton.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

  import Button, { type ButtonProps } from '$lib/components/Button.svelte'

  interface InputButtonProps extends ButtonProps {
    label: string
    placeholder?: string
    error?: string | null
    required?: false
  }

  let {
    children,
    label,
    placeholder = '',
    error = null,
    disabled = false,
    required = false,
    loading = false,
    ...restProps
  }: InputButtonProps = $props()

  // When no children provided, show placeholder style
  const hasContent = $derived(!!children)
</script>

<div class="input-button-wrapper">
  <fieldset class:error={!!error} class:disabled>
    <legend class:required>{label}</legend>
    <Button
      {...restProps}
      {disabled}
      {loading}
      class={{ placeholder: !hasContent }}
      --bg-color="transparent"
      --color="var(--color-text-primary)"
      --border="none"
      --active-bg-color="var(--color-background-elevated)"
      --active-color="var(--color-text-primary)"
      --disabled-bg-color="transparent"
      --disabled-border-color="var(--color-border-default)"
      --justify-content="flex-start"
      --font-weight="var(--font-weight-regular)"
      --font-size="var(--font-size-body)"
      --padding="0 var(--space-4)"
      --min-height="var(--tap-min)"
      --border-radius="var(--radius-md)">
      {#if hasContent}
        {@render children()}
      {:else}
        {placeholder}
      {/if}
    </Button>
  </fieldset>

  <div class="error-message" aria-live="polite" class:visible={!!error}>
    {error || '\u00a0'}
  </div>
</div>

<style>
  .input-button-wrapper {
    width: 100%;
  }

  /* Match Input.svelte fieldset */
  fieldset {
    min-height: var(--tap-min);
    position: relative;
    display: flex;
    align-items: center;
    padding: 0;
    padding-inline-start: var(--space-2);
    margin: 0;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    background-color: var(--color-background-screen);
    transition:
      border-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);
  }

  fieldset:focus-within {
    border-color: var(--color-border-focused);
    box-shadow: var(--ring);
  }

  fieldset.error {
    border-color: var(--color-error);
  }

  fieldset.error:focus-within {
    border-color: var(--color-error);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
  }

  fieldset.disabled {
    background-color: var(--color-background-elevated);
    border-color: var(--color-border-default);
    opacity: 0.6;
  }

  /* Legend mirrors Input.svelte */
  legend {
    position: absolute;
    right: var(--space-4);
    top: 0;
    transform: translateY(-50%);
    padding: 0 var(--space-2);
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    pointer-events: none;
    background:
      linear-gradient(var(--color-background-app), var(--color-background-app)) top / 100% 50%
        no-repeat,
      linear-gradient(var(--color-background-screen), var(--color-background-screen)) bottom / 100%
        50% no-repeat;
  }

  legend.required::after {
    content: ' *';
    color: var(--color-error);
  }

  fieldset:focus-within legend {
    color: var(--color-primary);
  }

  fieldset.error legend {
    color: var(--color-error);
  }

  fieldset.disabled legend {
    color: var(--color-text-tertiary);
  }

  /* Make inner button behave like the Input element */
  :global(button) {
    width: 100%;
    height: 100%;
    min-height: initial;
    border-radius: inherit;
    color: var(--color-text-primary);
    background: transparent;
    text-align: left;
  }

  /* Placeholder look matches Input placeholder color */
  :global(button.placeholder) {
    color: var(--color-text-tertiary);
  }

  /* Error text block matches Input */
  .error-message {
    margin-top: var(--space-2);
    font-size: var(--font-size-caption);
    color: var(--color-error);
    line-height: var(--line-height-normal);
    opacity: 0;
    transition: opacity var(--duration-fast) var(--ease-out);
    min-height: 1em; /* keep layout stable */
  }
  .error-message.visible {
    opacity: 1;
  }

  /* High contrast & reduced motion parity */
  @media (prefers-contrast: high) {
    fieldset {
      border-width: 2px;
    }
    fieldset:focus-within {
      box-shadow: 0 0 0 3px #000000;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    fieldset {
      transition: none;
    }
    .error-message {
      transition: none;
    }
  }
</style>
