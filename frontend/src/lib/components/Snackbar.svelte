<script lang="ts" module>
  import { Toaster as MeltToaster } from 'melt/builders'

  export type ToastData = {
    title: string
    description: string
    type?: 'success' | 'error' | 'warning' | 'info'
    action?: {
      label: string
      callback: () => void
    }
  }

  const snackbar = new MeltToaster<ToastData>({
    closeDelay: 10000,
    hover: null,
  })

  export const addSnack = snackbar.addToast
</script>

<script lang="ts">
  import { quintOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'

  import { dismissable } from '$lib/actions/gestures'

  let formActionsHeight = $state(0)

  $effect(() => {
    // This dynamic positioning logic remains the same
    const appRoot = document.getElementById('app')
    if (!appRoot) return
    let debounceTimer: number
    const updateHeight = () => {
      const formActionsEl = appRoot.querySelector('.form-actions') as HTMLElement | null
      const newHeight = formActionsEl ? formActionsEl.offsetHeight : 0
      if (newHeight !== formActionsHeight) formActionsHeight = newHeight
    }
    const debouncedUpdate = () => {
      window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(updateHeight, 50)
    }
    updateHeight()
    const observer = new MutationObserver(debouncedUpdate)
    observer.observe(appRoot, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      window.clearTimeout(debounceTimer)
    }
  })

  const containerBottomPosition = $derived(
    `calc(var(--bottom-nav-height, 0px) + var(--spacing-m) + ${formActionsHeight}px)`,
  )

  function handleActionClick(snack: any) {
    snack.data.action?.callback()
    snack.close()
  }
</script>

<div
  {...snackbar.root}
  class="snackbar-container"
  style:--bottom-position={containerBottomPosition}
  aria-live="polite">
  {#each snackbar.toasts as snack (snack.id)}
    <div
      {...snack.content}
      class="snack {snack.data.type || 'info'}"
      role="status"
      aria-atomic="true"
      in:fly={{ y: 20, duration: 350, easing: quintOut }}
      out:fly={{ y: 10, duration: 250, opacity: 0 }}
      use:dismissable={{
        axis: 'x',
        dismissThreshold: 0.3,
        onDismiss: () => snack.close,
      }}>
      <div class="snack-content">
        <h3 {...snack.title} class="snack-title">{snack.data.title}</h3>
        <p {...snack.description} class="snack-description">{snack.data.description}</p>
      </div>

      {#if snack.data.action}
        <button class="action-button" onclick={() => handleActionClick(snack)}>
          {snack.data.action.label}
        </button>
      {/if}

      <button {...snack.close} type="button" class="close-button" aria-label="Dismiss notification">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line
          ></svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .snackbar-container {
    /* --- KEY FIX --- */
    /* Force LTR direction to make left/right properties behave predictably,
       even inside an RTL application. Also resets any unwanted margins. */
    direction: ltr;
    margin: 0;
    padding: 0 var(--spacing-m);
    background: transparent;
    border: none;

    /* Positioning (now works correctly because of direction: ltr) */
    position: fixed;
    bottom: var(--bottom-position);
    left: 0;
    right: 0;
    width: 100vw;
    z-index: 9999;

    /* Layout for the snacks inside */
    display: flex;
    flex-direction: column-reverse;
    align-items: stretch; /* Makes snacks full-width */
    gap: var(--spacing-s);

    pointer-events: none;
    transition: bottom var(--duration-medium) var(--ease-out-quint);
  }

  .snack {
    /* This rule is now correct and does not need changes */
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
    padding: var(--spacing-s) var(--spacing-xs) var(--spacing-s) var(--spacing-m);
    background-color: var(--color-background-surface);
    color: var(--color-text-primary);
    border-radius: var(--radius-m);
    box-shadow: var(--shadow-lg);
    border-left: 4px solid;
    pointer-events: auto;
    touch-action: pan-y;
    contain: layout paint style;
  }

  /* All other styles below are correct */
  .snack.info {
    border-left-color: var(--color-semantic-info-fg);
  }
  .snack.success {
    border-left-color: var(--color-semantic-success-fg);
  }
  .snack.warning {
    border-left-color: var(--color-semantic-warning-fg);
  }
  .snack.error {
    border-left-color: var(--color-semantic-error-fg);
  }
  .snack-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding-block: var(--spacing-xs);
  }
  .snack-title {
    margin: 0;
    font-size: var(--font-size-label-l);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: 1.4;
  }
  .snack-description {
    margin: 0;
    font-size: var(--font-size-label-m);
    font-weight: var(--font-weight-regular);
    color: var(--color-text-secondary);
  }
  .action-button {
    all: unset;
    flex-shrink: 0;
    box-sizing: border-box;
    cursor: pointer;
    padding: var(--spacing-s) var(--spacing-m);
    border-radius: var(--radius-s);
    color: var(--color-interactive-accent-default);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-label-m);
    transition:
      background-color var(--transition-fast),
      transform 0.1s ease-out;
    -webkit-tap-highlight-color: transparent;
  }
  .action-button:active {
    background-color: rgba(var(--accent-rgb), 0.15);
    transform: scale(0.96);
  }
  .close-button {
    all: unset;
    box-sizing: border-box;
    flex-shrink: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--size-tap-target) * 0.8);
    height: calc(var(--size-tap-target) * 0.8);
    border-radius: var(--radius-full);
    color: var(--color-text-secondary);
    transition:
      background-color var(--transition-fast),
      transform 0.1s ease-out;
    -webkit-tap-highlight-color: transparent;
  }
  .close-button:active {
    background-color: var(--color-background-surface-active);
    transform: scale(0.92);
  }
  :global([popover]) {
    inset: unset;
  }
</style>
