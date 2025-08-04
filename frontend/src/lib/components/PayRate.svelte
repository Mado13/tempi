<script lang="ts">
  import Input from '$lib/components/Input.svelte'
  import type { ProjectPosition } from '$lib/schemas/project_position.schema.svelte'

  interface Props {
    value: ProjectPosition['payment']['rate']
    rateType: ProjectPosition['payment']['rateType']
    error?: string
  }

  let { value = $bindable(), rateType = $bindable('daily'), error = undefined }: Props = $props()
</script>

<div class="pay-rate-wrapper">
  <div class="input-container">
    <span class="currency-symbol">₪</span>
    <Input
      label="Pay Rate"
      id="pay-rate-amount"
      type="number"
      inputmode="decimal"
      placeholder="0"
      textAlign="center"
      bind:value
      {error} />
  </div>

  <button
    onclick={() => (rateType = 'daily')}
    type="button"
    class="rate-button"
    class:active={rateType === 'daily'}>
    Daily
  </button>
  <button
    onclick={() => (rateType = 'hourly')}
    type="button"
    class="rate-button"
    class:active={rateType === 'hourly'}>
    Hourly
  </button>
</div>

<style>
  .pay-rate-wrapper {
    display: flex;
    gap: var(--space-3);
    width: 100%;
  }

  .input-container {
    flex-grow: 1;
    position: relative;
  }

  .input-container :global(input) {
    /* Add extra padding for currency symbol */
    padding-inline-start: calc(var(--space-4) + var(--space-6)) !important;
  }

  .currency-symbol {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    inset-inline-start: var(--space-4);
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
    z-index: 10;
    pointer-events: none;
  }

  .rate-button {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--tap-min); /* Match input height exactly */
    min-width: 60px;
    padding: 0 var(--space-4);
    font-family: var(--font-family-app);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-caption);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    background-color: var(--color-background-screen);
    color: var(--color-text-secondary);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    touch-action: manipulation;
  }

  .rate-button:active {
    transform: scale(0.95);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .rate-button.active {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-on-primary);
    box-shadow: var(--shadow-subtle);
  }

  .rate-button.active:active {
    background-color: var(--color-primary-active);
    border-color: var(--color-primary-active);
  }

  /* RTL support */
  :global([dir='rtl']) .currency-symbol {
    inset-inline-start: auto;
    inset-inline-end: var(--space-4);
  }

  :global([dir='rtl']) .input-container :global(input) {
    padding-inline-start: var(--space-4) !important;
    padding-inline-end: calc(var(--space-4) + var(--space-6)) !important;
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .rate-button {
      border-width: 2px;
    }

    .rate-button.active {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .rate-button {
      transition: none;
    }
  }
</style>
