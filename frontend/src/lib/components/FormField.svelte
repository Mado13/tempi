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

<div>
  <label for={id} class:required>
    {label}
  </label>
  <input {id} {type} {placeholder} bind:value class:error={!!error} {...restProps} />
  <div class:has-error={!!error} aria-live="polite">
    {error || '\u00a0'}
  </div>
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-s);
    padding: 0 var(--spacing-m);

    > label {
      display: block;
      font-size: var(--font-size-label-m);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      line-height: 1.4;
      margin-bottom: var(--spacing-s);
      &.required::after {
        content: ' *';
        color: var(--color-semantic-error-fg);
      }
    }
  }

  input.error {
    border-color: var(--color-semantic-error-fg);
    background-color: var(--color-semantic-error-bg);

    &:focus {
      box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.25);
    }
  }

  .has-error {
    font-size: var(--font-size-label-s);
    color: var(--color-semantic-error-fg);
    font-weight: var(--font-weight-medium);
    min-height: 1.25rem; /* Prevent layout shift */
  }
</style>
