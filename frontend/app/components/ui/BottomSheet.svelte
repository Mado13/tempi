<script lang="ts">
import { createDialog, melt } from '@melt-ui/svelte'
import { quintOut } from 'svelte/easing'
import { fly } from 'svelte/transition'

let { children, open = $bindable() } = $props()

open = () => {
  dialogOpen.set(true)
}

const {
  elements: { portalled, overlay, content, close },
  states: { open: dialogOpen },
} = createDialog({
  portal: 'body',
  preventScroll: true,
  closeOnOutsideClick: true,
  defaultOpen: false,
})
</script>

{#if $dialogOpen}
  <div use:melt={$portalled}>
    <div use:melt={$overlay} transition:fly={{ y: '100%', duration: 300, easing: quintOut }}></div>
    <div
      use:melt={$content}
      class="bottom-sheet"
      transition:fly={{ y: '100%', duration: 300, easing: quintOut }}
      role="dialog"
      aria-modal="true"
    >
      <div class="bottom-sheet__handle"></div>
      <div class="bottom-sheet__header">
        <h2 class="bottom-sheet__title">Select Date Range</h2>
        <button
          use:melt={$close}
          class="bottom-sheet__close"
          type="button"
          aria-label="Close date picker"
        >
          ✕
        </button>
      </div>
      {@render children()}
      <div class="bottom-sheet__footer">
        <button class="approve-button" onclick={() => dialogOpen.set(false)} type="button"> Approve </button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
[data-melt-dialog-overlay] {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  max-height: 85vh;
  z-index: 51;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);

  /* Safe area for mobile devices */
  padding-bottom: env(safe-area-inset-bottom);

  &__handle {
    width: 32px;
    height: 4px;
    background: #d1d5db;
    border-radius: 9999px;
    margin: 8px auto 0;
    flex-shrink: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px 8px;
    border-bottom: 1px solid #f3f4f6;
    flex-shrink: 0;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #111827;
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    min-height: 44px; /* Mobile touch target */
    min-width: 44px;
    background: none;
    border: none;
    border-radius: 6px;
    font-size: 20px;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s ease;

    /* Touch optimizations */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;

    /* Active state for touch instead of hover */
    &:active {
      background: #f3f4f6;
      color: #111827;
    }

    &:focus {
      outline: none;
      background: #e5e7eb;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
  }

  &__selected-range {
    padding: 12px 24px;
    background: #f9fafb;
    border-bottom: 1px solid #f3f4f6;
    flex-shrink: 0;
  }

  &__footer {
    padding: 16px 24px;
    border-top: 1px solid #f3f4f6;
    background: white;
    position: sticky;
    bottom: 0;
    z-index: 10;
    flex-shrink: 0;

    margin-bottom: $navbar-height;
    margin-bottom: calc(#{$navbar-height} + env(safe-area-inset-bottom, 0));
  }
}

.approve-button {
  width: 100%;
  padding: 12px 16px;
  min-height: 44px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  /* Touch optimizations */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  /* Active state for touch instead of hover */
  &:active {
    background: #2563eb;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
}

</style>
