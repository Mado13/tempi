<script lang="ts">
  import { Debounced } from 'runed'

  import { GoogleMapsPlaces } from '$lib/utils/google-maps/places'
  import { type GoogleMapsFormLocationInput } from '$lib/utils/google-maps/schema'

  import FormField from './FormField.svelte'
  import SearchableBottomSheet from './SearchableBottomSheet.svelte'

  const SEARCH_DEBOUNCE_MS = 300
  const MIN_SEARCH_LENGTH = 3

  interface Props {
    value?: GoogleMapsFormLocationInput
    error?: string
    required: boolean
  }

  let {
    value = $bindable<GoogleMapsFormLocationInput | undefined>(),
    error,
    required,
  }: Props = $props()

  let searchState = $state({
    query: '',
    results: {},
    isLoading: false,
    isOpen: false,
  })

  let placeHolderAddress = $derived.by(() => {
    if (!value) return ''
    if (value?.formattedAddress.includes(value?.name)) {
      return value?.formattedAddress
    }

    return `${value?.name}, ${value?.formattedAddress}`
  })

  const debouncedSearch = new Debounced(() => searchState.query, SEARCH_DEBOUNCE_MS)
  let shouldSearch = $derived(debouncedSearch.current.length >= MIN_SEARCH_LENGTH)

  async function searchPlaces(query: string) {
    searchState.isLoading = true
    try {
      searchState.results = await places.fetchAutocompleteSuggestions(query)
    } catch (error) {
      //TODO: Handle error properly
    } finally {
      searchState.isLoading = false
    }
  }

  $effect(() => {
    if (!shouldSearch) {
      searchState.results = {}
      return
    }
    searchPlaces(debouncedSearch.current)
  })

  const places = new GoogleMapsPlaces({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
    requestedLanguage: 'he',
    requestedRegion: 'IL',
  })

  const onResultClick = async (id: string) => {
    const result = await places.fetchPlaceDetails(id)
    value = result
    searchState.isOpen = false
    searchState.query = ''
  }
</script>

<FormField
  id="address"
  label="Address"
  placeholder="Enter an address..."
  {error}
  {required}
  value={placeHolderAddress ?? ''}
  readonly
  onclick={() => (searchState.isOpen = true)} />

<SearchableBottomSheet
  title="Add Address"
  placeholder="Search for an address..."
  loading={searchState.isLoading}
  results={searchState.results}
  {onResultClick}
  bind:open={searchState.isOpen}
  bind:value={searchState.query} />
