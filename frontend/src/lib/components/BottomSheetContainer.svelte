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
  <div class="backdrop" role="presentation" transition:fade={{ duration: 200 }}>
    <div
      bind:this={sheetElement}
      class="sheet"
      class:full-height={config.fullHeight}
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
        ignore: 'a, button, input, textarea, select, .content',
      }}>
      {#if enableSwipe}
        <div class="drag-indicator" aria-hidden="true"></div>
      {/if}

      {#if config.title || config.header}
        <header class="header">
          {#if config.header}
            {@render config.header()}
          {:else if config.title}
            <h3>{config.title}</h3>
          {/if}
          <button
            class="close-btn"
            type="button"
            aria-label="Close bottom sheet"
            onclick={() => bottomSheet.close()}>
            <IconPhX />
          </button>
        </header>
      {/if}

      <div class="content">
        {@render config.content()}
      </div>

      {#if config.footer}
        <div class="footer">
          {@render config.footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    /* GPU acceleration */
    will-change: opacity;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    /* Optimized backdrop blur - only on iOS where it performs well */
    @supports (-webkit-backdrop-filter: blur(1px)) {
      -webkit-backdrop-filter: blur(4px);
      backdrop-filter: blur(4px);
    }
  }

  .sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-background-surface);
    border-radius: var(--radius-l) var(--radius-l) 0 0;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    padding-bottom: var(--safe-area-bottom);
    height: auto;
    max-height: calc(100vh - var(--safe-area-top) - var(--spacing-xl));
    touch-action: none;
    /* GPU acceleration - critical for smooth animations */
    will-change: transform;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    /* Prevent paint during animation */
    contain: layout style paint;
  }

  .sheet.full-height {
    height: 100%;
    max-height: 100%;
    padding-top: var(--safe-area-top);
    padding-bottom: 0;
    border-radius: 0;
  }

  .drag-indicator {
    width: 36px;
    height: 4px;
    background: var(--color-border-default);
    border-radius: var(--radius-full);
    margin: var(--spacing-s) auto;
    flex-shrink: 0;
    /* Optimize for interaction */
    touch-action: none;
    cursor: grab;
  }

  .header {
    display: flex;
    align-items: center;
    padding: 0 var(--spacing-m) var(--spacing-m);
    border-bottom: 1px solid var(--color-border-default);
    flex-shrink: 0;
    /* Prevent layout shift */
    contain: layout;
  }

  .header:first-child {
    padding-top: var(--spacing-m);
  }

  .header h3 {
    flex: 1;
    margin: 0;
    font-size: var(--font-size-headline-s);
    font-weight: var(--font-weight-semibold);
  }

  .close-btn {
    width: var(--size-tap-target);
    height: var(--size-tap-target);
    display: grid;
    place-items: center;
    background: transparent;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-m);
    color: var(--color-text-secondary);
    cursor: pointer;
    flex-shrink: 0;
    font-size: 1.5rem;
    transition: background-color var(--transition-fast);
    /* Optimize for touch */
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .close-btn:active {
    background: var(--color-background-surface-active);
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-m);
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    min-height: 0;
    /* Optimize scrolling performance */
    will-change: scroll-position;
    /* Create stacking context for better performance */
    isolation: isolate;
  }

  .footer {
    flex-shrink: 0;
    /* Prevent layout shift */
    contain: layout;
  }

  .footer:not(:empty) {
    padding: var(--spacing-m);
    padding-top: var(--spacing-xs);
    background: var(--color-background-surface);
    border-top: 1px solid var(--color-border-default);
  }

  /* Optimize animations */
  @media (prefers-reduced-motion: reduce) {
    .backdrop,
    .sheet {
      transition-duration: 0.01ms !important;
    }
  }
</style>
