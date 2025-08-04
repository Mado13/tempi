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
  <fieldset class:error={!!error} class:disabled>
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

    /* Create the border cut-out effect */
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
  }

  input:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }

  input::placeholder {
    color: var(--color-text-tertiary);
    opacity: 1;
  }

  input:disabled {
    color: var(--color-text-tertiary);
    cursor: not-allowed;
    -webkit-user-select: none;
    user-select: none;
  }

  .error-message {
    margin-top: var(--space-2);
    font-size: var(--font-size-caption);
    color: var(--color-error);
    line-height: var(--line-height-normal);
    opacity: 0;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .error-message.visible {
    opacity: 1;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    fieldset {
      border-width: 2px;
    }

    fieldset:focus-within {
      box-shadow: 0 0 0 3px #000000;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    fieldset {
      transition: none;
    }
  }
</style>
