<script lang="ts">
  import { quintOut } from 'svelte/easing'
  import { fade, slide } from 'svelte/transition'

  let { open = $bindable(false), title = '', showHeader = true, children } = $props()

  let backdropElement = $state()

  // Handle body scroll prevention when modal is open
  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  })

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === backdropElement) {
      open = false
    }
  }

  function handleClose() {
    open = false
  }
</script>

{#if open}
  <div
    class="slide-up-overlay"
    bind:this={backdropElement}
    onclick={handleBackdropClick}
    transition:fade={{ duration: 200 }}>
    <div
      class="slide-up-container"
      transition:slide={{ duration: 300, easing: quintOut, axis: 'y' }}>
      {#if showHeader && title}
        <header class="slide-up-header">
          <button class="close-button" onclick={handleClose} aria-label="Close">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
          <h2>{title}</h2>
          <div></div>
          <!-- Spacer for centering -->
        </header>
      {/if}

      <div class="slide-up-content">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  .slide-up-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    align-items: flex-end;
  }

  .slide-up-container {
    width: 100%;
    max-height: 90vh;
    background-color: var(--color-background-surface);
    border-radius: var(--radius-l) var(--radius-l) 0 0;
    box-shadow:
      0 -8px 32px rgba(0, 0, 0, 0.12),
      0 -1px 2px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-bottom: var(--safe-area-bottom);
  }

  .slide-up-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: var(--spacing-m);
    border-bottom: 1px solid var(--color-border-default);
    background-color: var(--color-background-surface);
    flex-shrink: 0;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size-tap-target);
    height: var(--size-tap-target);
    min-height: var(--size-tap-target);
    background-color: transparent;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-m);
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    &:active {
      background-color: var(--color-background-surface-active);
      transform: scale(0.95);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  h2 {
    font-size: var(--font-size-headline-s);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    text-align: center;
    margin: 0;
  }

  .slide-up-content {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
</style>
