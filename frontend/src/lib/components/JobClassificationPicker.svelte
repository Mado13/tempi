<script lang="ts">
  import { Document } from 'flexsearch'
  import { Debounced } from 'runed'

  import type { Item, JobDocument } from '$lib/types/job'
  import { buildSearchItems } from '$lib/utils/serach_item_builder'

  import data from '../../../data/job_classifications.json'
  import SearchableBottomSheet from './SearchableBottomSheet.svelte'

  let { value = $bindable(), open = $bindable() } = $props()

  let query = $state('')
  let groupedResults = $state<Record<string, JobDocument[]>>({})

  const debouncedQuery = new Debounced(() => query, 200)

  const enhancedData = $derived.by(() =>
    data.map((job) => ({
      ...job,
      parentContext: job.path.slice(0, -1).join(' > '),
    })),
  )

  const itemsList = $derived.by((): Item[] =>
    buildSearchItems({
      searchResults: groupedResults,
      selectedItems: value || {},
      allData: enhancedData,
      selectedGroupLabel: 'Selected',
    }),
  )

  let index: Document | null = null

  // Initialize search index
  $effect(() => {
    if (!enhancedData.length) return
    index = new Document({
      tokenize: 'forward',
      resolution: 3,
      document: {
        id: 'id',
        index: ['label', 'searchText'],
        store: ['id', 'label', 'hierarchy', 'parentContext'],
      },
    })
    enhancedData.forEach((doc) => index!.add(doc))
  })

  // Search effect
  $effect(() => {
    const currentQuery = debouncedQuery.current

    if (!currentQuery) {
      groupedResults = {}
      return
    }
    if (!index) return

    const fields = index.search(currentQuery, { limit: 20, enrich: true }) as any[]
    const docs: JobDocument[] = []
    const seenIds = new Set<string>()

    fields.forEach((field) => {
      field.result.forEach((r: any) => {
        const id = String(r.id)
        if (!seenIds.has(id)) {
          seenIds.add(id)
          docs.push(r.doc as JobDocument)
        }
      })
    })

    groupedResults = groupBy(docs)
  })

  function groupBy(docs: JobDocument[]): Record<string, JobDocument[]> {
    const groups: Record<string, JobDocument[]> = {}
    const seen = new Map<string, Set<string>>()
    for (const doc of docs) {
      const key = doc.hierarchy.group.label
      if (!seen.has(key)) {
        seen.set(key, new Set())
        groups[key] = []
      }
      if (!seen.get(key)!.has(doc.id)) {
        seen.get(key)!.add(doc.id)
        groups[key].push(doc)
      }
    }
    return groups
  }
</script>

<SearchableBottomSheet
  multiSelect
  title="Job Classification"
  placeholder="Type to search..."
  loading={query !== debouncedQuery.current}
  items={itemsList}
  bind:open
  bind:value={query}
  bind:selectedItems={value}
  Icon={IconTablerTag} />
