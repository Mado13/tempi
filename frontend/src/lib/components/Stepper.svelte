<script lang="ts">
  let { value = $bindable(), label, error, min = 1, step = 1, required = false } = $props()

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

<div class="input-wrapper">
  <fieldset class:error={!!error}>
    <legend class:required>{label}</legend>

    <div class="stepper-content-wrapper">
      <button type="button" onclick={decrement} disabled={isMinDisabled} aria-label="Decrease">
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

      <button type="button" onclick={increment} aria-label="Increase"> + </button>
    </div>
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
    background: var(--color-background-screen);
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

  /* === Stepper-Specific Content === */
  .stepper-content-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 0 var(--space-2);
  }

  .stepper-content-wrapper > button {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    font-size: var(--font-size-heading);
    font-weight: var(--font-weight-medium);
    color: var(--color-primary);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    touch-action: manipulation;
  }

  .stepper-content-wrapper > button:active {
    background-color: rgba(var(--primary-rgb), 0.12);
    transform: scale(0.95);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .stepper-content-wrapper > button:disabled {
    color: var(--color-text-tertiary);
    cursor: not-allowed;
    background-color: transparent;
  }

  .stepper-content-wrapper > input {
    width: 100%;
    height: 100%;
    padding: 0 var(--space-3);
    font-size: 16px !important; /* Prevent iOS zoom */
    font-family: var(--font-family-app);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    text-align: center;
    background: transparent;
    border: none;
    outline: none;
    box-shadow: none;
    -webkit-appearance: none;
    appearance: none;
    -webkit-user-select: text;
    user-select: text;
  }

  .stepper-content-wrapper > input:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }

  .stepper-content-wrapper > input::placeholder {
    color: var(--color-text-tertiary);
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
    .stepper-content-wrapper > button {
      border: 1px solid currentColor;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    fieldset,
    .stepper-content-wrapper > button {
      transition: none;
    }
  }

  /* Mobile touch targets */
  .stepper-content-wrapper > button {
    min-width: var(--tap-min);
    min-height: var(--tap-min);
  }
</style>
