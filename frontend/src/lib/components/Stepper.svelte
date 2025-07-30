<script lang="ts">
  let { value = $bindable(), label, error, min = 1, step = 1 } = $props()

  const isMinDisabled = $derived(value <= min)

  function increment() {
    value = (value || 0) + step
  }

  function decrement() {
    value = Math.max(min, value - step)
  }

  function onblur(event: FocusEvent & { currentTarget: HTMLInputElement }) {
    const rawValue = parseInt(event.currentTarget.value, 10)
    if (isNaN(rawValue) || rawValue < min) {
      value = min
    } else {
      value = rawValue
    }
  }
</script>

<div>
  <fieldset class:has-error={!!error}>
    <legend>{label}</legend>

    <div class="stepper-content-wrapper">
      <button type="button" onclick={decrement} disabled={isMinDisabled} aria-label="dec">
        −
      </button>

      <input
        type="text"
        role="spinbutton"
        inputmode="numeric"
        pattern="[0-9]*"
        bind:value
        {onblur}
        aria-live="polite"
        aria-valuemin={min}
        aria-valuenow={value} />

      <button type="button" onclick={increment} aria-label="Increment"> + </button>
    </div>
  </fieldset>

  <div class="error-message" aria-live="polite">
    {error || '\u00a0'}
  </div>
</div>

<style>
  div {
    width: 100%;

    > fieldset {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: var(--size-tap-target);
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

      > legend {
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
      }
    }
  }

  .error-message {
    font-size: var(--font-size-label-s);
    color: var(--color-semantic-error-fg);
    font-weight: var(--font-weight-medium);
    min-height: calc(var(--spacing-s) + var(--font-size-label-s));
    padding-top: var(--spacing-xs);
  }

  /* --- Stepper-Specific Styles (Inside the fieldset) --- */

  .stepper-content-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 0 var(--spacing-s);

    > button {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full); /* Make them circular */
      font-size: var(--font-size-headline-m);
      color: var(--color-interactive-accent-default);
      cursor: pointer;
      transition: background-color var(--transition-fast);
      &:active {
        background-color: var(--color-background-surface-active);
      }
      &:disabled {
        color: var(--color-text-placeholder);
        cursor: not-allowed;
        background-color: transparent;
      }
    }

    > input {
      border: none;
      outline: none;
      box-shadow: none;
      background-color: transparent;
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
      text-align: center;
      color: var(--color-text-primary);
      font-family: var(--font-family-base);
      font-weight: var(--font-weight-semibold);
      font-size: 16px !important; /* Prevents iOS zoom */
      -webkit-user-select: text;
      user-select: text;
    }
  }
</style>
