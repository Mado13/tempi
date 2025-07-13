<script lang="ts">
  import { fade } from 'svelte/transition'

  import { dismissable } from '$lib/actions/gestures'
  import * as snackbar from '$lib/snackbar/snackbar.service.svelte'
  import type { SnackbarMessage } from '$lib/snackbar/snackbar.service.svelte'

  let formActionsHeight = $state(0)

  // Sets app a mutation observer to know when there is a form button.
  $effect(() => {
    const appRoot = document.getElementById('app')
    if (!appRoot) return

    let debounceTimer: number

    // This function checks for the element and updates the height state.
    const updateHeight = () => {
      const formActionsEl = appRoot.querySelector('.form-actions') as HTMLElement | null
      const newHeight = formActionsEl ? formActionsEl.offsetHeight : 0

      // Only update state if the height has actually changed.
      if (newHeight !== formActionsHeight) {
        formActionsHeight = newHeight
      }
    }

    // We debounce the update function to prevent it from running on every
    // single micro-change during a page transition, ensuring good performance.
    const debouncedUpdate = () => {
      window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(updateHeight, 50) // 50ms debounce window
    }

    // Run an initial check when the component first mounts.
    updateHeight()

    const observer = new MutationObserver(() => {
      // Any time a mutation is observed, trigger a debounced update.
      debouncedUpdate()
    })

    observer.observe(appRoot, {
      childList: true,
      subtree: true,
    })

    // Cleanup function: disconnect the observer and clear any pending timers.
    return () => {
      observer.disconnect()
      window.clearTimeout(debounceTimer)
    }
  })

  const containerBottomPosition = $derived(
    `calc(var(--bottom-nav-height, 0px) + var(--spacing-m) + ${formActionsHeight}px + var(--spacing-s))`,
  )

  function handleActionClick(notification: SnackbarMessage) {
    notification.action?.callback()
    snackbar.dismiss(notification.id)
  }
</script>

<div
  class="snackbar-container"
  style:bottom={containerBottomPosition}
  aria-live="polite"
  aria-atomic="true">
  {#each snackbar.snackbarState.queue as notification (notification.id)}
    <div
      class="snackbar {notification.type}"
      use:dismissable={{
        axis: 'x',
        lockDirection: false,
        dismissThreshold: 0.3,
        onDismiss: () => snackbar.dismiss(notification.id),
      }}
      transition:fade|local={{ duration: 200 }}
      role="status"
      style="--opacity: 1;">
      <p class="snackbar-message">{notification.message}</p>
      {#if notification.action}
        <button class="action-button" onclick={() => handleActionClick(notification)}>
          {notification.action.label}
        </button>
      {/if}
      <button
        type="button"
        class="close-button"
        onclick={() => snackbar.dismiss(notification.id)}
        aria-label="סגור">
        &times;
      </button>
    </div>
  {/each}
</div>

<style>
  .snackbar-container {
    position: fixed;
    left: var(--spacing-m);
    right: var(--spacing-m);
    z-index: 9999;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: var(--spacing-s);
    pointer-events: none;
    transition: bottom 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .snackbar {
    opacity: var(--opacity, 1);
    touch-action: pan-y;
    direction: rtl;
    width: 100%;
    max-width: 420px;
    padding: 0 var(--spacing-l);
    background-color: var(--color-background-surface);
    border-left: 4px solid var(--color-border-default);
    color: var(--color-text-primary);
    border-radius: var(--radius-m);
    box-shadow: var(--shadow-lg);
    font-family: var(--font-family-base);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-label-l);
    line-height: 1.4;
    pointer-events: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-s);
  }
  .snackbar.info {
    background-color: var(--color-background-surface);
    color: var(--color-text-primary);
  }
  .snackbar.success {
    border-left-color: var(--color-semantic-success-fg);
  }
  .snackbar.warning {
    border-left-color: var(--color-semantic-warning-fg);
  }
  .snackbar.error {
    border-left-color: var(--color-semantic-error-fg);
  }
  .snackbar.loading {
    background-color: var(--color-background-surface);
    color: var(--color-text-secondary);
  }
  .snackbar-message {
    margin: 0;
    color: inherit;
    font-size: inherit;
    flex-grow: 1;
    text-align: right;
    padding: var(--spacing-s) 0;
  }
  .action-button {
    all: unset;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    min-height: var(--size-tap-target);
    padding: var(--spacing-s) var(--spacing-m);
    border-radius: var(--radius-s);
    font-weight: var(--font-weight-semibold);
    color: var(--color-interactive-accent-default);
    transition:
      background-color var(--transition-fast),
      transform 0.1s;
  }
  .action-button:active {
    background-color: rgba(108, 98, 208, 0.2);
    transform: scale(0.96);
  }
  .close-button {
    all: unset;
    box-sizing: border-box;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: var(--size-tap-target);
    height: var(--size-tap-target);
    border-radius: var(--radius-full);
    color: var(--color-text-secondary);
    font-size: 1.25rem;
    line-height: 1;
    transition:
      background-color var(--transition-fast),
      transform 0.1s;
  }
  .close-button:active {
    background-color: rgba(0, 0, 0, 0.1);
    transform: scale(0.92);
  }
</style>
