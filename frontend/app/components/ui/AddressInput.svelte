<script lang="ts">
import { createCombobox, melt } from '@melt-ui/svelte'
import { Debounced } from 'runed'
import { onMount } from 'svelte'
import { writable } from 'svelte/store'

import { GoogleMapsPlaces } from '@/lib/google-maps-places'

import { m } from '$paraglide/messages'

let { selected: bindableSelected = $bindable() } = $props()
const selected = writable(bindableSelected)

const places = new GoogleMapsPlaces(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

let suggestedAddresses = $state<Record<string, string>>({})

const {
  elements: { menu, input, option, label },
  states: { open, inputValue },
} = createCombobox({
  forceVisible: true,
  selected,
  onSelectedChange: async ({ next: { value: addressId } }) => {
    const details = await places.fetchPlaceDetails(addressId)
    if (details) {
      bindableSelected = { ...details, addressId }
      inputValue.set([details.name, details.formattedAddress].filter(Boolean).join(', '))
    }
  },
})

const debouncedInputValue = new Debounced(() => $inputValue, 300)

onMount(async () => {
  await places.load()
})

$effect(() => {
  if (!debouncedInputValue.current || debouncedInputValue.current.length < 3) return
  let cancelled = false
  ;(async () => {
    try {
      const suggestions = await places.fetchAutocompleteSuggestions(debouncedInputValue.current)
      if (!cancelled) {
        suggestedAddresses = suggestions
      }
    } catch (err) {
      console.error('Error loading suggestions:', err)
    }
  })()

  return () => {
    cancelled = true
  }
})
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<label use:melt={$label}>
  <span>{m['add_job.locaation.value']()}</span>
</label>
<input
  use:melt={$input}
  oninput={() => {
    if (!places.sessionToken) {
      places.createSessionToken()
    }
  }}
/>

{#if $open && $inputValue.length >= 3}
  <ul use:melt={$menu}>
    <div>
      {#each Object.entries(suggestedAddresses) as [placeId, label]}
        <li
          use:melt={$option({
            value: placeId,
            label: label,
          })}
        >
          <div>
            <span>{label}</span>
          </div>
        </li>
      {/each}
    </div>
  </ul>
{/if}

<style lang="scss">
ul {
  z-index: 10;
  background-color: white;
}
</style>
