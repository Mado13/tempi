<script lang="ts">
  import Input from '$lib/components/Input.svelte'
  import type { Job } from '$lib/schemas/job.scehma'

  interface Props {
    value: Job['payment']['amount']
    rateType: Job['payment']['method']
    error?: string
  }

  let { value = $bindable(), rateType = $bindable('daily'), error = undefined }: Props = $props()
</script>

<div>
  <div class="input-container">
    <span class="currency-symbol">₪</span>
    <Input
      label="Pay Rate"
      id="pay-rate-amount"
      type="number"
      inputmode="decimal"
      placeholder="0"
      textAlign="center"
      bind:value />
  </div>

  <div class="rate-type-selector">
    <button onclick={() => (rateType = 'daily')} type="button" class:active={rateType === 'daily'}
      >Daily</button>
    <button onclick={() => (rateType = 'hourly')} type="button" class:active={rateType === 'hourly'}
      >Hourly</button>
  </div>
</div>

<style>
  div {
    display: flex;
    gap: var(--spacing-s);

    .input-container {
      flex-grow: 1;
      position: relative;

      :global(input) {
        /* Add extra padding on the logical start side to not overlap the symbol */
        padding-inline-start: calc(var(--spacing-m) + var(--spacing-m)) !important;
      }

      .currency-symbol {
        position: absolute;
        top: 35%; /* Perfect vertical centering */
        transform: translateY(-50%);
        /* Position from the logical start (respects RTL) */
        inset-inline-start: var(--spacing-m);
        font-size: var(--font-size-body-r);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-medium);
        z-index: 1; /* Ensure it's above the input's content */
        pointer-events: none; /* Make it non-interactive */
      }
    }

    .rate-type-selector {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      height: var(--size-tap-target);
      padding: var(--spacing-xs);
      background-color: var(--color-background-page); /* Inset look */
      border-radius: var(--radius-m);
      border: none;

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        border: none;
        background: transparent;
        cursor: pointer;
        font-family: var(--font-family-base);
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-label-m);
        border-radius: var(--radius-s); /* Use the smaller radius for inner elements */
        padding: 0 var(--spacing-m);
        transition: all var(--transition-fast);
        color: var(--color-text-secondary);

        &.active {
          background-color: var(--color-interactive-accent-default);
          color: var(--color-text-on-accent);
          box-shadow: var(--shadow-card);
        }
      }
    }
  }
</style>
