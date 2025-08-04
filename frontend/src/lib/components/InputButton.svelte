<!-- lib/components/InputButton.svelte -->
<script lang="ts">
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

  const hasContent = $derived(!!children)
</script>

<div class="input-button-wrapper">
  <fieldset class:error={!!error} class:disabled>
    <legend class:required>{label}</legend>
    <Button
      {...restProps}
      {disabled}
      {loading}
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
        <span class="placeholder">{placeholder}</span>
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
    margin-bottom: var(--space-4);
  }

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

    background-color: var(--color-background-app);
    box-shadow: var(--shadow-border);

    transition:
      border-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out);

    &:focus-within {
      border-color: var(--color-border-focused);
      background-color: var(--color-background-screen);
      box-shadow: var(--ring), var(--shadow-elevated);
    }

    &.error {
      border-color: var(--color-error);
      background-color: var(--color-background-screen);
      box-shadow: var(--shadow-subtle);

      &:focus-within {
        border-color: var(--color-error);
        box-shadow:
          0 0 0 3px rgba(239, 68, 68, 0.18),
          var(--shadow-floating);
      }
    }

    &.disabled {
      background-color: var(--color-background-app);
      border-color: var(--color-border-default);
      box-shadow: none;
      opacity: 0.6;
    }

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
        linear-gradient(var(--color-background-screen), var(--color-background-screen)) top / 100%
          50% no-repeat,
        linear-gradient(var(--color-background-app), var(--color-background-app)) bottom / 100% 50%
          no-repeat;

      transition:
        color var(--duration-fast) var(--ease-out),
        background var(--duration-fast) var(--ease-out);

      &.required::after {
        content: ' *';
        color: var(--color-error);
      }
    }

    &:focus-within legend,
    &.error legend {
      background:
        linear-gradient(var(--color-background-screen), var(--color-background-screen)) top / 100%
          50% no-repeat,
        linear-gradient(var(--color-background-screen), var(--color-background-screen)) bottom /
          100% 50% no-repeat;
    }

    &:focus-within legend {
      color: var(--color-primary);
    }

    &.error legend {
      color: var(--color-error);
    }

    &.disabled legend {
      color: var(--color-text-tertiary);
    }
  }

  :global(button) {
    width: 100%;
    height: 100%;
    min-height: initial;
    border-radius: inherit;
    background: transparent;
    text-align: left;

    color: var(--color-text-primary);
  }

  :global(button.placeholder) {
    color: var(--color-text-tertiary);
  }

  .error-message {
    margin-top: var(--space-2);
    font-size: var(--font-size-caption);
    color: var(--color-error);
    line-height: var(--line-height-normal);
    opacity: 0;
    transition: opacity var(--duration-fast) var(--ease-out);

    &.visible {
      opacity: 1;
    }
  }

  /* High contrast & reduced motion parity */
  @media (prefers-contrast: high) {
    fieldset {
      border-width: 2px;

      &:focus-within {
        box-shadow: 0 0 0 3px #000000;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    fieldset {
      transition: none;

      legend {
        transition: none;
      }
    }

    .error-message {
      transition: none;
    }
  }
</style>
