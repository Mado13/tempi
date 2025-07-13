<script lang="ts">
  import { Keyboard } from '@capacitor/keyboard'
  import type { Snippet } from 'svelte'
  import { fade, fly } from 'svelte/transition'

  import { dismissable } from '$lib/actions/gestures'

  interface Props {
    open?: boolean
    title?: string
    fullHeight?: boolean
    children: Snippet
    footer?: Snippet
    header?: Snippet
  }

  let {
    open = $bindable(false),
    title = '',
    fullHeight = false,
    children,
    footer,
    header,
  }: Props = $props()

  let sheetElement = $state<HTMLElement>()
  let keyboardHeight = $state(0)
  let dragOffset = $state(0)

  $effect(() => {
    if (!open) return

    Keyboard.addListener('keyboardWillShow', (info) => {
      keyboardHeight = info.keyboardHeight
    })

    Keyboard.addListener('keyboardWillHide', () => {
      keyboardHeight = 0
    })

    return () => {
      Keyboard.removeAllListeners()
    }
  })

  $effect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  })
</script>

{#if open}
  <div
    class="backdrop"
    role="presentation"
    onclick={() => (open = false)}
    transition:fade={{ duration: 200 }}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="sheet"
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-label={title || 'Bottom sheet'}
      bind:this={sheetElement}
      class:full-height={fullHeight}
      style:--keyboard-height="{keyboardHeight}px"
      style:transform="translateY({dragOffset}px)"
      transition:fly={{ y: '100%', duration: 300 }}
      onclick={(e) => e.stopPropagation()}
      use:dismissable={{
        axis: 'y',
        onDismiss: () => (open = false),
        fadeOnDrag: false,
        dismissThreshold: 0.3,
      }}>
      <div class="drag-indicator"></div>

      {#if title || header}
        <header class="header">
          {#if header}
            {@render header()}
          {/if}
          <h3>{title}</h3>
          <button
            class="close-btn"
            type="button"
            aria-label="Close bottom sheet"
            onclick={() => (open = false)}>
            <IconPhPlusSquare />
          </button>
        </header>
      {/if}

      <div class="content">
        {@render children()}
      </div>

      {#if footer}
        <div class="footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    top: var(--safe-area-top);
    bottom: var(--safe-area-bottom);
    left: var(--safe-area-left);
    right: var(--safe-area-right);
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
  }

  .sheet {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-background-surface);
    border-top: 1px solid var(--color-border-default);
    border-radius: var(--radius-l) var(--radius-l) 0 0;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease-out;
    touch-action: none;
    padding-bottom: var(--safe-area-bottom);

    &.full-height {
      height: 100%;
      padding-top: var(--safe-area-top);
      padding-bottom: 0;
      border-radius: 0;
      border-top: none;
    }
  }

  .drag-indicator {
    width: 36px;
    height: 4px;
    background: var(--color-border-default);
    border-radius: var(--radius-full);
    margin: var(--spacing-s) auto;
    flex-shrink: 0;
  }

  .header {
    display: flex;
    align-items: center;
    padding: 0 var(--spacing-m) var(--spacing-m);
    border-bottom: 1px solid var(--color-border-default);
    flex-shrink: 0;
  }

  .header h3 {
    flex: 1;
    margin: 0;
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
  }

  .footer {
    flex-shrink: 0;
    &:not(:empty) {
      padding: var(--spacing-m);
      padding-top: var(--spacing-xs);
      background: var(--color-background-surface);
      border-top: 1px solid var(--color-border-default);
    }
  }
</style>
