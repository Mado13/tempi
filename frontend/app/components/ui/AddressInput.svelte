<script lang="ts">
import { Capacitor } from '@capacitor/core'
import { CapacitorHttp } from '@capacitor/core'
import { onMount } from 'svelte'

import { GoogleMapsPlaces } from '@/lib/google-maps-places'

import { m } from '$i18n/paraglide/messages'

import Combobox from './Combobox.svelte'

onMount(async () => {
  await places.load()
  await testGoogleAPI()
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

async function testGoogleAPI() {
  console.log('Testing Google Places API...')
  console.log('Is native platform:', Capacitor.isNativePlatform())

  const testInput = 'tel aviv'
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(testInput)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`

  try {
    if (Capacitor.isNativePlatform()) {
      console.log('Using Capacitor Http...')
      const response = await CapacitorHttp.get({ url })
      console.log('Capacitor response:', response)
    } else {
      console.log('Using fetch...')
      const response = await fetch(url)
      const data = await response.json()
      console.log('Fetch response:', data)
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
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

<!-- <button onclick={testGoogleAPI}>Test Google API</button> -->
<!-- svelte-ignore a11y_label_has_associated_control -->
