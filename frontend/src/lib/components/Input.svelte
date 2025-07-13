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
  <input
    {id}
    {type}
    {placeholder}
    bind:value
    class:error={!!error}
    {...restProps}
    aria-describedby="{id}-error" />
  <div class:has-error={!!error} aria-live="polite">
    {error || '\u00a0'}
  </div>
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-s);

    > input {
      font-size: 16px !important; /* Critical: Prevent iOS zoom on focus */
      text-align: var(--text-align);
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      display: block;
      width: 100%;
      padding: 0 var(--spacing-m);
      min-height: var(--size-tap-target);
      font-family: var(--font-family-base);
      color: var(--color-text-primary);
      background-color: var(--color-background-surface);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-m);
      transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);
      touch-action: manipulation;

      &.error {
        border-color: var(--color-semantic-error-fg);

        &:focus {
          box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.25);
        }
      }
    }

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

  .has-error {
    font-size: var(--font-size-label-s);
    color: var(--color-semantic-error-fg);
    font-weight: var(--font-weight-medium);
    min-height: var(--spacing-m); /* Prevent layout shift */
  }
</style>
