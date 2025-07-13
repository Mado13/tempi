<script lang="ts">
  import type { Component } from 'svelte'

  import BottomSheet from './BottomSheet.svelte'
  import PrimaryButton from './PrimaryButton.svelte'

  export interface Item {
    id: string
    label: string
    group?: string
    context?: string
  }

  interface Props {
    title?: string
    placeholder?: string
    loading: boolean
    items: Item[]
    open: boolean
    value: string
    Icon: Component
    multiSelect?: boolean
    selectedItems?: Record<string, string>
    onResultClick?: (item: Item) => void
  }

  let {
    title,
    placeholder,
    loading,
    items,
    onResultClick,
    Icon,
    multiSelect = false,
    open = $bindable(),
    value = $bindable(),
    selectedItems = $bindable({}),
  }: Props = $props()

  // Internal IME polling mechanism
  let inputElement = $state<HTMLInputElement>()
  let pollingInterval: ReturnType<typeof setInterval> | null = null

  const groups = $derived.by(() => {
    const map: Record<string, Item[]> = {}
    for (const item of items) {
      const key = item.group ?? ''
      if (!map[key]) map[key] = []
      map[key].push(item)
    }
    return map
  })

  function handleItemClick(item: Item) {
    if (multiSelect) {
      if (selectedItems[item.id]) {
        delete selectedItems[item.id]
      } else {
        selectedItems[item.id] = item.label
      }
    } else {
      onResultClick?.(item)
      open = false
    }
  }

  function isSelected(itemId: string): boolean {
    return multiSelect && !!selectedItems[itemId]
  }

  // Start polling for IME support when focused
  function startPolling() {
    if (pollingInterval) return

    pollingInterval = setInterval(() => {
      if (inputElement && inputElement.value !== value) {
        value = inputElement.value
      }
    }, 50) // Poll every 50ms when focused
  }

  // Stop polling when blurred
  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  function handleFocus() {
    startPolling()
  }

  function handleBlur() {
    stopPolling()
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    // Still update value from events for English/other languages
    value = target.value
  }

  // Cleanup on unmount
  $effect(() => {
    return () => stopPolling()
  })
</script>

<BottomSheet fullHeight {title} bind:open>
  <div class="search-container">
    <input
      bind:this={inputElement}
      type="search"
      class="search-input"
      bind:value
      {placeholder}
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      onfocus={handleFocus}
      onblur={handleBlur}
      oninput={handleInput} />
  </div>
  <div class="results" class:loading>
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <span>Searching...</span>
      </div>
    {:else if items.length === 0 && !(Object.keys(selectedItems).length > 0)}
      <div class="no-results">
        <span>No addresses found</span>
      </div>
    {:else}
      {#each Object.entries(groups) as [group, groupItems]}
        {#if group && group.trim()}
          <div class="group-header">
            {group}
          </div>
        {/if}
        {#each groupItems as item}
          <button
            type="button"
            class:selected={isSelected(item.id)}
            onclick={() => handleItemClick(item)}>
            <Icon class="result-icon" />
            <span class="result-text">{item.label}</span>
            {#if multiSelect && isSelected(item.id)}
              <IconTablerCheck />
            {/if}
          </button>
        {/each}
      {/each}
    {/if}
  </div>
  {#snippet footer()}
    {#if multiSelect}
      <PrimaryButton
        onclick={() => (open = false)}
        disabled={!(Object.keys(selectedItems).length > 0)}>
        Approve
      </PrimaryButton>
    {/if}
  {/snippet}
</BottomSheet>

<style>
  .search-container {
    padding: 0 0 var(--spacing-m);
    position: sticky;
    top: 0;
    background: var(--color-background-surface);
    z-index: 1;
    > input {
      width: 100%;
      font-size: 16px !important; /* Prevent zoom */
      padding: 0 var(--spacing-m);
      min-height: var(--size-tap-target);
      font-family: var(--font-family-base);
      color: var(--color-text-primary);
      background: var(--color-background-page);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-m);
      transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--color-border-focused);
        box-shadow: var(--ring-accent);
      }
    }
  }

  .results {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);

    .group-header {
      padding: var(--spacing-s) var(--spacing-m);
      font-size: var(--font-size-label-m);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    > button {
      display: flex;
      align-items: center;
      gap: var(--spacing-m);
      width: 100%;
      min-height: var(--size-tap-target);
      padding: var(--spacing-m);
      background: var(--color-background-surface);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-m);
      text-align: end; /* RTL support */
      font-family: var(--font-family-base);
      font-size: var(--font-size-body-r);
      color: var(--color-text-primary);
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      transition: all var(--transition-fast);

      /* RTL layout - icon on right for RTL languages */
      direction: rtl;

      &.selected {
        background: var(--color-background-surface-active);
        border-color: var(--color-interactive-accent-default);

        span {
          font-weight: var(--font-weight-medium);
        }
      }

      &:active {
        background: var(--color-background-surface-active);
        border-color: var(--color-interactive-accent-default);
        transform: scale(0.98);
      }

      &:focus-visible {
        outline: none;
        border-color: var(--color-border-focused);
        box-shadow: var(--ring-accent);
      }

      /* Checkmark on far left (last child in RTL) */
      > :global(svg:last-child) {
        flex-shrink: 0;
        color: var(--color-interactive-accent-default);
      }

      > :global(svg.result-icon) {
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        color: var(--color-interactive-accent-default);
      }

      span {
        flex: 1;
        font-weight: var(--font-weight-regular);
        line-height: 1.4;
        /* Reset direction for text content */
        direction: ltr;
        text-align: end;
      }
    }

    .loading-state,
    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      color: var(--color-text-secondary);
      font-size: var(--font-size-body-r);
      gap: var(--spacing-m);
    }

    .spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid var(--color-border-default);
      border-top: 2px solid var(--color-interactive-accent-default);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
</style>
