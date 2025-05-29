<script lang="ts">
import { createCombobox, melt } from '@melt-ui/svelte'
import { type ChangeFn } from '@melt-ui/svelte/internal/helpers'
import { Debounced } from 'runed'
import { watch } from 'runed'
import { writable } from 'svelte/store'
import { fly } from 'svelte/transition'

interface Props {
  inputLabel: string
  onSelectedChange: ChangeFn<any> | undefined
  searchFunction?: (query: string) => Promise<Record<string, Array<{ id: string; label: string }>>>
  onSearchStart?: () => void
  displayValue?: string
  selected?: any
  showGroupHeaders?: boolean
}

let {
  inputLabel,
  onSelectedChange,
  searchFunction,
  displayValue = $bindable(''),
  selected: bindableSelected = $bindable(),
  onSearchStart,
  showGroupHeaders,
}: Props = $props()

const selected = writable(bindableSelected)
let searchResults = $state<Record<string, Array<{ id: string; label: string }>>>({})

const {
  elements: { menu, input, option, label },
  states: { open, inputValue },
} = createCombobox({
  selected,
  onSelectedChange: selection => {
    onSelectedChange?.(selection)
    displayValue = selection.next?.label || ''
    inputValue.set(selection.next?.label)

    return selection.next
  },
})

const debouncedInputValue = new Debounced(() => $inputValue, 300)

watch(
  () => debouncedInputValue.current,
  currentValue => {
    if (!searchFunction) return
    if (!currentValue || currentValue.length < 3) return

    $inspect({ searchResults })

    onSearchStart?.()

    let cancelled = false

    ;(async () => {
      try {
        searchResults = {}

        const suggestions = await searchFunction(currentValue)
        if (!cancelled) {
          searchResults = suggestions
        }
      } catch (err) {
        console.error('Error loading suggestions:', err)
        searchResults = {}
      }
    })()

    return () => {
      cancelled = true
    }
  },
)
</script>

<label use:melt={$label}>
  <span>{inputLabel}</span>
</label>
<input use:melt={$input} />
<ul
  use:melt={$menu}
  class:hidden={!$open || $inputValue.length < 3}
  transition:fly={{ duration: 150, y: -5 }}
>
  {#if Object.keys(searchResults).length > 0}
    {#each Object.entries(searchResults) as [groupName, items] (groupName)}
      {#if showGroupHeaders}
        <li class="group-header">
          <h4>{groupName}</h4>
        </li>
      {/if}
      {#each items as item (item.id)}
        <li use:melt={$option({ value: item.id, label: item.label })}>
          <span>{item.label}</span>
        </li>
      {/each}
    {/each}
  {:else}
    <li>No results found</li>
  {/if}
</ul>

<style lang="scss">
[data-melt-combobox-menu] {
  z-index: 10;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: $border-radius;
  box-shadow: $shadow-md;
  margin-top: $spacing-xs;
  max-height: min(300px, calc(100vh - #{$navbar-height} - #{$spacing-xl}));
  min-height: $touch-target-size;
  overflow-y: auto;
  list-style: none;
  margin-left: 0;
  margin-right: 0;
  padding: $spacing-xs 0;
  
  // iOS momentum scrolling
  -webkit-overflow-scrolling: touch;
  
  [data-melt-combobox-option] {
    min-height: $touch-target-size;
    padding: 12px $spacing-md;
    display: flex;
    align-items: center;
    font-size: 16px;
    
    // Mobile touch states only
    &:active,
    &[data-highlighted] {
      background-color: rgba($primary-color, 0.12);
    }
    
    &:focus {
      outline: 2px solid $primary-color;
      outline-offset: -2px;
      background-color: rgba($primary-color, 0.08);
    }
    
    // Improve readability on small screens
    @media (max-width: $breakpoint-sm) {
      padding: 14px $spacing-md;
      min-height: 52px;
    }
  }
  
  li {
    min-height: $touch-target-size;
    padding: 12px $spacing-md;
    display: flex;
    align-items: center;
    font-size: 16px;
    
    @media (max-width: $breakpoint-sm) {
      padding: 14px $spacing-md;
      min-height: 52px;
    }
  }
  
  // Handle scrollbar styling for better mobile experience
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
}

// Enhanced hidden state
.hidden {
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity $transition-fast, visibility $transition-fast;
}
</style>
