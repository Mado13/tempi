<script lang="ts">
  import { Debounced, watch } from 'runed'
  import IconTablerTag from '~icons/tabler/tag'

  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import * as bottomSheet from '$lib/services/bottomsheet.service.svelte'
  import {
    allClassifications,
    searchClassifications,
  } from '$lib/services/job-classification.service'
  import type { Item, JobDocument } from '$lib/types/job'
  import { buildSearchItems } from '$lib/utils/serach_item_builder'

  // Import the reusable components
  import SearchableList from './SearchableList.svelte'

  let { value = $bindable({}), open = $bindable(false) } = $props()

  // All your existing state and derived logic remains exactly the same.
  let query = $state('')
  const debouncedQuery = new Debounced(() => query, 200)

  const searchResults = $derived.by(() => {
    return searchClassifications(debouncedQuery.current)
  })

  const groupedResults = $derived.by(() => {
    return groupBy(searchResults)
  })

  const itemsList = $derived.by((): Item[] =>
    buildSearchItems({
      searchResults: groupedResults,
      selectedItems: value || {},
      allData: allClassifications,
      selectedGroupLabel: 'Selected',
    }),
  )

  function groupBy(docs: JobDocument[]): Record<string, JobDocument[]> {
    const groups: Record<string, JobDocument[]> = {}
    for (const doc of docs) {
      const key = doc.hierarchy.group.label
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(doc)
    }
    return groups
  }

  // Apply the watch pattern to interact with the bottom sheet service
  watch(
    () => open,
    (isOpen) => {
      if (isOpen) {
        bottomSheet.show({
          id: 'job-classification-picker',
          title: 'Job Classification',
          content: pickerContent,
          footer: footerContent, // Provide the footer for the approve button
          fullHeight: true,
          onClose: () => {
            open = false
          },
        })
      } else {
        if (bottomSheet.bottomSheetState.current?.id === 'job-classification-picker') {
          bottomSheet.close()
        }
      }
    },
  )
</script>

{#snippet pickerContent()}
  <SearchableList
    multiSelect
    placeholder="Type to search..."
    loading={query !== debouncedQuery.current}
    items={itemsList}
    Icon={IconTablerTag}
    bind:value={query}
    bind:selectedItems={value} />
{/snippet}

{#snippet footerContent()}
  <PrimaryButton onclick={() => (open = false)} disabled={Object.keys(value || {}).length === 0}>
    Approve
  </PrimaryButton>
{/snippet}
