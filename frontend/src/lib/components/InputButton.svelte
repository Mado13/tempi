<script lang="ts">
  import Button, { type ButtonProps } from '$lib/components/Button.svelte'

  interface InputButtonProps extends ButtonProps {
    error?: string
    placeholder?: string
    label: string
  }

  let {
    children,
    placeholder,
    label,
    loading = false,
    error,
    ...restProps
  }: InputButtonProps = $props()
</script>

<div class="input-button-wrapper">
  <fieldset class="input-button-fieldset" class:has-error={!!error}>
    <legend>{label}</legend>
    <Button
      {loading}
      {...restProps}
      --bg-color="transparent"
      --border="none"
      --active-bg-color="var(--color-background-surface-active)"
      --active-color="var(--color-text-primary)"
      --disabled-bg-color="transparent"
      --justify-content="flex-start"
      --font-weight="var(--font-weight-regular)"
      --font-size="var(--font-size-body-r)"
      --padding="0 var(--spacing-m)">
      {#if children}
        {@render children()}
      {:else}
        {placeholder}
      {/if}
    </Button>
  </fieldset>

  <div class="error-message" aria-live="polite">
    {error || '\u00a0'}
  </div>
</div>

<style>
  .input-button-wrapper {
    fieldset {
      height: var(--size-tap-target);
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0;
      margin: 0;
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-m);
      background-color: var(--color-background-surface);
      transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);

      &:focus-within {
        border-color: var(--color-border-focused);
        box-shadow: var(--ring-accent);
      }

      &.has-error {
        border-color: var(--color-semantic-error-fg);

        &:focus-within {
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-semantic-error-fg) 25%, transparent);
        }
      }

      legend {
        position: absolute;
        top: 0;
        right: var(--spacing-s);
        transform: translateY(-50%);
        padding: 0 var(--spacing-s);
        font-size: var(--font-size-label-s);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
        background-image: linear-gradient(
          to bottom,
          var(--color-background-page) 0%,
          var(--color-background-page) 50%,
          var(--color-background-surface) 50%,
          var(--color-background-surface) 100%
        );
        transition: color var(--transition-fast);
      }

      :global(button) {
        width: 100%;
        height: 100%;
        min-height: initial;
        border-radius: inherit;
        color: var(--color-text-primary);
      }
    }

    :global(button.error) {
      border-color: var(--color-semantic-error-fg);

      &:focus {
        box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.25);
      }
    }

    :global(button.placeholder) {
      color: var(--color-text-placeholder);
    }
  }

  .has-error {
    font-size: var(--font-size-label-s);
    color: var(--color-semantic-error-fg);
    font-weight: var(--font-weight-medium);
    min-height: var(--spacing-m);
  }
</style>
