<script lang="ts">
import { onMount } from 'svelte'

import { GoogleMapsPlaces } from '@/lib/google-maps-places'

import { m } from '$i18n/paraglide/messages'

import Combobox from './Combobox.svelte'

onMount(async () => {
  await places.load()
})

let { selected = $bindable() } = $props()

const places = new GoogleMapsPlaces(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

let addressDisplayText = $state('')

const handleAddressSelection = async ({
  next: { value: addressId },
}: {
  next: { value: string }
}) => {
  const details = await places.fetchPlaceDetails(addressId)
  if (details) {
    selected = { ...details, addressId }
    addressDisplayText = [details.name, details.formattedAddress].filter(Boolean).join(', ')
  }
}

const handleSearchStart = () => {
  places.destroySessionToken()
  places.createSessionToken()
}

const searchAddresses = async (
  query: string,
): Promise<Record<string, Array<{ id: string; label: string }>>> => {
  const flatResults = await places.fetchAutocompleteSuggestions(query)

  return {
    Addresses: Object.entries(flatResults).map(([id, label]) => ({ id, label })),
  }
}
</script>

<Combobox
  bind:displayValue={addressDisplayText}
  bind:selected
  inputLabel={m['add_job.locaation.value']()}
  onSelectedChange={handleAddressSelection}
  searchFunction={searchAddresses}
  onSearchStart={handleSearchStart}
/>
