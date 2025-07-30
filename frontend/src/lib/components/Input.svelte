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
    ...restProps
  } = $props()
</script>

<div class="input-wrapper">
  <fieldset class:error={!!error}>
    <legend class:required>{label}</legend>
    <input {id} {type} {placeholder} bind:value {...restProps} />
  </fieldset>
  <div class="error-message" aria-live="polite">
    {error || '\u00a0'}
  </div>
</div>

<style>
  fieldset {
    height: var(--size-tap-target);
    position: relative;
    display: flex; /* Ensure content inside can be aligned */
    align-items: center; /* Vertically center content */
    padding: 0;
    margin: 0;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-m);
    background-color: var(--color-background-surface);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  legend {
    position: absolute;
    inset-inline-start: var(--spacing-m);
    top: 0;
    transform: translateY(-50%);
    padding: 0 var(--spacing-xs);
    font-size: var(--font-size-label-s);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    --legend-top-bg: var(--color-background-page);
    background:
      linear-gradient(var(--legend-top-bg), var(--legend-top-bg)) top / 100% 50% no-repeat,
      linear-gradient(var(--color-background-surface), var(--color-background-surface)) bottom /
        100% 50% no-repeat;
  }

  input {
    width: 100%;
    height: 100%; /* Fill the fieldset height */
    padding: 0 var(--spacing-m);
    font-size: 16px !important;
    font-family: var(--font-family-base);
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    outline: none;
  }

  .error-message {
    min-height: var(--spacing-m);
    font-size: var(--font-size-label-s);
    color: var(--color-semantic-error-fg);
  }

  /* other error/focus styles as per your system */
</style>
