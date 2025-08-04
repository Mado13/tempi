<script lang="ts">
  import type { Component } from 'svelte'

  export interface Item {
    id: string
    label: string
    group?: string
    context?: string
  }

  interface Props {
    items: Item[]
    loading: boolean
    value: string
    Icon: Component
    placeholder?: string
    multiSelect?: boolean
    selectedItems?: Record<string, string>
    onResultClick?: (item: Item) => void
  }

  let {
    items,
    loading,
    Icon,
    placeholder,
    onResultClick,
    multiSelect = false,
    value = $bindable(),
    selectedItems = $bindable({}),
  }: Props = $props()

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
    }
  }

  function isSelected(itemId: string): boolean {
    return multiSelect && !!selectedItems[itemId]
  }

  function startPolling() {
    if (pollingInterval) return
    pollingInterval = setInterval(() => {
      if (inputElement && inputElement.value !== value) {
        value = inputElement.value
      }
    }, 50)
  }
  function stopPolling() {
    if (pollingInterval) clearInterval(pollingInterval)
    pollingInterval = null
  }
  function handleInput(event: Event) {
    value = (event.target as HTMLInputElement).value
  }

  $effect(() => stopPolling)
</script>

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
    onfocus={startPolling}
    onblur={stopPolling}
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
        <div class="group-header">{group}</div>
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

<style>
  /* Searchable List - Fixed for Design System */

  .search-container {
    padding: 0 0 var(--space-4); /* Changed from --spacing-m */
    position: sticky;
    top: 0;
    background: var(--color-background-screen);
    z-index: 1;
  }

  .search-container > .search-input {
    width: 100%;
    font-size: 16px !important; /* Prevent zoom */
    padding: 0 var(--space-4); /* Changed from --spacing-m */
    min-height: var(--tap-min); /* Changed from --size-tap-target */
    font-family: var(--font-family-app); /* Changed from --font-family-base */
    color: var(--color-text-primary);
    background: var(--color-background-app);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md); /* Changed from --radius-m */
    transition:
      border-color var(--duration-fast) var(--ease-out),
      /* Changed from --transition-fast */ box-shadow var(--duration-fast) var(--ease-out);
  }

  .search-container > .search-input:focus {
    outline: none;
    border-color: var(--color-border-focused);
    box-shadow: var(--ring); /* Changed from --ring-accent */
  }

  .results {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    gap: var(--space-2); /* Changed from --spacing-xs */
    background: var(--color-background-app);
    padding: var(--space-4);
    margin: 0 calc(var(--space-4) * -1);
  }

  .results .group-header {
    padding: var(--space-3) var(--space-4); /* Changed from --spacing-s --spacing-m */
    font-size: var(--font-size-caption); /* Changed from --font-size-label-m */
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .results > button {
    display: flex;
    align-items: center;
    gap: var(--space-4); /* Changed from --spacing-m */
    width: 100%;
    min-height: var(--tap-min); /* Changed from --size-tap-target */
    padding: var(--space-4); /* Changed from --spacing-m */
    background: var(--color-background-screen); /* Fixed: White background for buttons */
    border: 1px solid var(--color-border-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md); /* Changed from --radius-m */
    text-align: end; /* RTL support */
    font-family: var(--font-family-app); /* Changed from --font-family-base */
    font-size: var(--font-size-body); /* Changed from --font-size-body-r */
    color: var(--color-text-primary);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: all var(--duration-fast) var(--ease-out); /* Changed from --transition-fast */

    /* RTL layout - icon on right for RTL languages */
    direction: rtl;
  }

  .results > button.selected {
    background: var(
      --color-background-elevated
    ); /* Using elevated instead of missing active token */
    border-color: var(--color-primary); /* Changed from --color-interactive-accent-default */
  }

  .results > button.selected span {
    font-weight: var(--font-weight-medium);
  }

  .results > button:active {
    background: var(--color-background-elevated);
    border-color: var(--color-primary); /* Changed from --color-interactive-accent-default */
    transform: scale(0.98);
  }

  .results > button:focus-visible {
    outline: none;
    border-color: var(--color-border-focused);
    box-shadow: var(--ring); /* Changed from --ring-accent */
  }

  /* Checkmark on far left (last child in RTL) */
  .results > button > :global(svg:last-child) {
    flex-shrink: 0;
    color: var(--color-primary); /* Changed from --color-interactive-accent-default */
  }

  .results > button > :global(svg.result-icon) {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-primary); /* Changed from --color-interactive-accent-default */
  }

  .results > button span {
    flex: 1;
    font-weight: var(--font-weight-regular);
    line-height: var(--line-height-normal); /* Changed from 1.4 */
    /* Reset direction for text content */
    direction: ltr;
    text-align: end;
  }

  .results .loading-state,
  .results .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8); /* Changed from --spacing-xl */
    color: var(--color-text-secondary);
    font-size: var(--font-size-body); /* Changed from --font-size-body-r */
    gap: var(--space-4); /* Changed from --spacing-m */
  }

  .results .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--color-border-default);
    border-top: 2px solid var(--color-primary); /* Changed from --color-interactive-accent-default */
    border-radius: var(--radius-full); /* Changed from 50% */
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

  /* Enhanced mobile interactions */
  @media (hover: hover) {
    .results > button:hover:not(.selected) {
      background: var(--color-background-app);
      border-color: var(--color-border-strong);
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .results > button.selected {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .results .spinner {
      animation: none;
      border-top-color: var(--color-primary);
    }

    .results > button {
      transition: none;
    }

    .results > button:active {
      transform: none;
    }
  }
</style>
