<!-- $lib/components/BottomSheetContainer.svelte -->
<script lang="ts">
  import { onClickOutside } from 'runed'
  import { cubicOut } from 'svelte/easing'
  import { fade, fly } from 'svelte/transition'

  import { dismissable } from '$lib/actions/gestures'
  import * as bottomSheet from '$lib/services/bottomsheet.service.svelte'

  let sheetElement = $state<HTMLElement>()
  let config = $derived(bottomSheet.bottomSheetState.current)
  let isOpen = $derived(!!config && !bottomSheet.bottomSheetState.isAnimating)

  // Pre-calculate for performance
  const enableSwipe = $derived(config?.swipeToClose !== false && !config?.fullHeight)
  const enableBackdrop = $derived(config?.backdropClose !== false)

  // Set up click outside handler
  $effect(() => {
    if (!sheetElement || !isOpen || !enableBackdrop) return

    const cleanup = onClickOutside(sheetElement, () => {
      bottomSheet.close()
    })

    return cleanup.stop
  })

  // Lock body scroll when open - using RAF for smooth transition
  $effect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        document.body.style.overflow = 'hidden'
      })
      return () => {
        document.body.style.overflow = ''
      }
    }
  })
</script>

{#if config}
  <div class="sheet-backdrop composite" role="presentation" transition:fade={{ duration: 200 }}>
    <div
      bind:this={sheetElement}
      class="sheet composite"
      class:sheet--full={config.fullHeight}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-label={config.title || 'Bottom sheet'}
      transition:fly={{
        y: '100%',
        duration: 300,
        easing: cubicOut,
      }}
      use:dismissable={{
        enabled: enableSwipe,
        axis: 'y',
        onDismiss: () => bottomSheet.close(),
        dismissThreshold: 0.3,
        flickVelocity: 0.5,
        lockDirection: true,
        fadeOnDrag: false,
        ignore: 'a, button, input, textarea, select, .sheet__content',
      }}>
      {#if enableSwipe}
        <div class="sheet__handle" aria-hidden="true"></div>
      {/if}

      {#if config.title || config.header}
        <header class="sheet__header">
          {#if config.header}
            {@render config.header()}
          {:else if config.title}
            <h3 class="sheet__title">{config.title}</h3>
          {/if}
          <button
            class="btn btn-ghost sheet__close"
            type="button"
            aria-label="Close bottom sheet"
            onclick={() => bottomSheet.close()}>
            <IconPhX />
          </button>
        </header>
      {/if}

      <div class="sheet__content scrollable">
        {@render config.content()}
      </div>

      {#if config.footer}
        <footer class="sheet__footer">
          {@render config.footer()}
        </footer>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Bottom Sheet - Your Style with Better Visual Hierarchy */

  .sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
  }

  .sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-background-screen);
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    box-shadow: var(--shadow-overlay);
    display: flex;
    flex-direction: column;
    padding-bottom: var(--safe-bottom);
    height: auto;
    max-height: calc(100dvh - var(--safe-top) - var(--space-8));
    touch-action: none;
    contain: layout style paint;
  }

  .sheet--full {
    height: 100dvh;
    max-height: 100dvh;
    padding-top: var(--safe-top);
    padding-bottom: var(--safe-bottom);
    border-radius: 0;
  }

  .sheet__handle {
    width: 36px;
    height: 4px;
    background: var(--color-border-default);
    border-radius: var(--radius-full);
    margin: var(--space-3) auto;
    flex-shrink: 0;
    touch-action: none;
  }

  .sheet__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border-default);
    flex-shrink: 0;
    contain: layout;
  }

  .sheet__title {
    flex: 1;
    margin: 0;
    font-size: var(--font-size-subhead);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    text-align: start;
  }

  .sheet__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--tap-min);
    height: var(--tap-min);
    padding: 0;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    touch-action: manipulation;
    transition: transform var(--duration-fast) var(--ease-out);
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .sheet__close:active {
    transform: scale(0.95);
  }

  .sheet__close svg {
    width: 24px;
    height: 24px;
  }

  .sheet__content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    padding: var(--space-4);
  }

  .sheet__footer {
    flex-shrink: 0;
    padding: var(--space-4);
    padding-top: var(--space-3);
    background: var(--color-background-screen);
    border-top: 1px solid var(--color-border-default);
    contain: layout;
  }

  /* IMPROVED SEARCH HIERARCHY - Keep your existing structure */
  .search-container {
    padding: 0 0 var(--space-4);
    position: sticky;
    top: calc(var(--space-4) * -1); /* Stick to content top */
    background: var(--color-background-screen); /* Match sheet background */
    margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1) 0; /* Extend to edges */
    padding-left: var(--space-4);
    padding-right: var(--space-4);
    padding-top: var(--space-4);
    z-index: 1;
  }

  .search-container > .search-input {
    width: 100%;
    font-size: 16px !important;
    padding: 0 var(--space-4);
    min-height: var(--tap-min);
    font-family: var(--font-family-app);
    color: var(--color-text-primary);
    background: var(--color-background-app); /* Subtle background difference */
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    transition:
      border-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);
  }

  .search-container > .search-input:focus {
    outline: none;
    border-color: var(--color-border-focused);
    background: var(--color-background-screen); /* Lift on focus */
    box-shadow: var(--ring);
  }

  /* CLEANER RESULTS */
  .results {
    flex: 1;
    overflow-y: visible; /* Let parent handle scroll */
    display: flex;
    flex-direction: column;
    gap: var(--space-1); /* Tighter spacing */
  }

  .results .group-header {
    padding: var(--space-3) var(--space-2);
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .results > button {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    width: 100%;
    min-height: var(--tap-min);
    padding: var(--space-4);
    background: transparent; /* Cleaner - no background by default */
    border: none; /* Remove border clutter */
    border-radius: var(--radius-md);
    text-align: end;
    font-family: var(--font-family-app);
    font-size: var(--font-size-body);
    color: var(--color-text-primary);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: all var(--duration-fast) var(--ease-out);
    direction: rtl;
  }

  .results > button.selected {
    background: rgba(var(--primary-rgb), 0.08); /* Subtle selection */
    color: var(--color-primary);
  }

  .results > button:active {
    background: var(--color-background-app);
    transform: scale(0.98);
  }

  .results > button > :global(svg:last-child) {
    flex-shrink: 0;
    color: var(--color-primary);
  }

  .results > button > :global(svg.result-icon) {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-primary);
  }

  .results > button span {
    flex: 1;
    font-weight: var(--font-weight-regular);
    line-height: var(--line-height-normal);
    direction: ltr;
    text-align: end;
  }

  .results .loading-state,
  .results .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8);
    color: var(--color-text-secondary);
    font-size: var(--font-size-body);
    gap: var(--space-4);
  }

  .results .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--color-border-default);
    border-top: 2px solid var(--color-primary);
    border-radius: var(--radius-full);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @supports (height: 100dvh) {
    .sheet {
      max-height: calc(100dvh - var(--safe-top) - var(--space-8));
    }

    .sheet--full {
      height: 100dvh;
      max-height: 100dvh;
    }
  }
</style>
