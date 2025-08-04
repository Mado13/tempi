<script lang="ts">
  import { Debounced, watch } from 'runed'

  import type { Item } from '$lib/components/SearchableList.svelte'
  import SearchableList from '$lib/components/SearchableList.svelte'
  import * as bottomSheet from '$lib/services/bottomsheet.service.svelte'
  import { GoogleMapsPlaces } from '$lib/utils/google-maps/places'
  import { type FormLocationInput } from '$lib/utils/google-maps/schema'

  const SEARCH_DEBOUNCE_MS = 300
  const MIN_SEARCH_LENGTH = 3

  interface Props {
    value?: FormLocationInput
    open: boolean
  }

  interface State {
    query: string
    results: Array<{ id: string; label: string }>
    isLoading: boolean
  }

  let { open = $bindable(), value = $bindable() }: Props = $props()

  let searchState = $state<State>({
    query: '',
    results: [],
    isLoading: false,
  })

  const places = new GoogleMapsPlaces({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
    requestedLanguage: 'he',
    requestedRegion: 'IL',
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

  const onResultClick = async (item: Item) => {
    const result = await places.fetchPlaceDetails(item.id)
    value = result
    open = false
    searchState.query = ''
  }

  watch(
    () => open,
    (isOpen) => {
      if (isOpen) {
        bottomSheet.show({
          id: 'address-picker',
          title: 'Add Address',
          content: pickerContent,
          fullHeight: true,
          onClose: () => {
            open = false
          },
        })
      } else {
        if (bottomSheet.bottomSheetState.current?.id === 'address-picker') {
          bottomSheet.close()
        }
      }
    },
  )
</script>

{#snippet pickerContent()}
  <SearchableList
    placeholder="Search for an address..."
    loading={searchState.isLoading}
    items={searchState.results}
    {onResultClick}
    Icon={IconTablerBuildingEstate}
    bind:value={searchState.query} />
{/snippet}
