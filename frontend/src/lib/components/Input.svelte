<!-- lib/components/Input.svelte -->
<script lang="ts">
  let {
    label,
    id,
    type = 'text',
    value = $bindable(),
    error = null,
    placeholder = '',
    required = false,
    disabled = false,
    ...restProps
  } = $props()
</script>

<div class="input-wrapper">
  <fieldset class:error={!!error} class:disabled class:filled={!!value}>
    <legend class:required>{label}</legend>
    <input {id} {type} {placeholder} {disabled} bind:value {...restProps} />
  </fieldset>
  <div class="error-message" aria-live="polite" class:visible={!!error}>
    {error || '\u00a0'}
  </div>
</div>

<style>
  .input-wrapper {
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

    &.filled {
      background-color: var(--color-background-screen);
      border-color: var(--color-border-strong);
      box-shadow: var(--shadow-subtle);

      &:focus-within {
        box-shadow: var(--ring), var(--shadow-floating);
      }
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
    &.filled legend,
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

    input {
      width: 100%;
      height: 100%;
      text-align: var(--text-align, right);
      padding: 0 var(--space-4);
      font-size: 16px; /* Prevent iOS zoom */
      font-family: var(--font-family-app);
      color: var(--color-text-primary);
      background: transparent;
      border: none;
      outline: none;
      box-shadow: none;
      -webkit-appearance: none;
      appearance: none;
      -webkit-user-select: text;
      user-select: text;

      &:focus {
        outline: none;
        border: none;
        box-shadow: none;
      }

      &::placeholder {
        color: var(--color-text-tertiary);
        opacity: 1;
      }

      &:disabled {
        color: var(--color-text-tertiary);
        cursor: not-allowed;
        -webkit-user-select: none;
        user-select: none;
      }
    }
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

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    fieldset {
      border-width: 2px;

      &:focus-within {
        box-shadow: 0 0 0 3px #000000;
      }
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    fieldset {
      transition: none;

      legend {
        transition: none;
      }
    }
  }
</style>
