<script lang="ts">
  import { Debounced } from 'runed'

  import SearchableBottomSheet, { type Item } from '$lib/components/SearchableBottomSheet.svelte'
  import { GoogleMapsPlaces } from '$lib/utils/google-maps/places'
  import { type GoogleMapsFormLocationInput } from '$lib/utils/google-maps/schema'

  const SEARCH_DEBOUNCE_MS = 300
  const MIN_SEARCH_LENGTH = 3

  interface Props {
    value?: GoogleMapsFormLocationInput
    open: boolean
  }

  interface State {
    query: string
    results: Array<{ id: string; label: string }>
    isLoading: boolean
  }

  let { open = $bindable(), value = $bindable<GoogleMapsFormLocationInput | undefined>() }: Props =
    $props()

  let searchState = $state<State>({
    query: '',
    results: [],
    isLoading: false,
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
      searchState.results = []
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

  const onResultClick = async (item: Item) => {
    const result = await places.fetchPlaceDetails(item.id)
    value = result
    open = false
    searchState.query = ''
  }
</script>

<SearchableBottomSheet
  title="Add Address"
  placeholder="Search for an address..."
  loading={searchState.isLoading}
  items={searchState.results}
  {onResultClick}
  Icon={IconTablerBuildingEstate}
  bind:open
  bind:value={searchState.query} />
