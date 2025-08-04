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
    `calc(var(--bottom-nav-height, 0px) + var(--space-4) + ${formActionsHeight}px)`,
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
        onDismiss: () => snack.close.onclick(),
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
        <IconPhX width={16} height={16} />
      </button>
    </div>
  {/each}
</div>

<style>
  .snackbar-container {
    /* Force LTR direction to make left/right properties behave predictably */
    direction: ltr;
    margin: 0;
    padding: 0 var(--space-4);
    background: transparent;
    border: none;

    /* Positioning */
    position: fixed;
    bottom: var(--bottom-position);
    left: 0;
    right: 0;
    width: 100vw;
    z-index: 9999;

    /* Layout for the snacks inside */
    display: flex;
    flex-direction: column-reverse;
    align-items: stretch;
    gap: var(--space-3);

    pointer-events: none;
    transition: bottom var(--duration-normal) var(--ease-out);
  }

  .snack {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-3) var(--space-4) var(--space-4);

    /* Modern glassmorphism styling from your design system */
    background: var(--glass-bg-light);
    backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);

    color: var(--color-text-primary);
    border-radius: var(--radius-xl);
    border-left: 3px solid;
    pointer-events: auto;
    touch-action: pan-y;
    contain: layout paint style;

    /* Add subtle transform for modern feel */
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* Type-specific colors using your design system */
  .snack.info {
    border-left-color: var(--color-info);
  }
  .snack.success {
    border-left-color: var(--color-success);
  }
  .snack.warning {
    border-left-color: var(--color-warning);
  }
  .snack.error {
    border-left-color: var(--color-error);
  }

  .snack-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding-block: var(--space-2);
  }

  .snack-title {
    margin: 0;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: var(--line-height-normal);
  }

  .snack-description {
    margin: 0;
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-regular);
    color: var(--color-text-secondary);
    line-height: var(--line-height-normal);
  }

  .action-button {
    all: unset;
    flex-shrink: 0;
    box-sizing: border-box;
    cursor: pointer;
    min-height: var(--tap-min);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    color: var(--color-primary);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-caption);
    transition:
      background-color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
    -webkit-tap-highlight-color: transparent;
  }

  .action-button:active {
    background-color: rgba(var(--primary-rgb), 0.1);
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
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    color: var(--color-text-secondary);
    transition:
      background-color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
    -webkit-tap-highlight-color: transparent;
  }

  .close-button:active {
    background-color: var(--color-background-app);
    transform: scale(0.92);
  }

  :global([popover]) {
    inset: unset;
  }
</style>
