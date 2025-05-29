<script lang="ts">
import { Document, type DocumentData } from 'flexsearch'
import { onMount } from 'svelte'

import data from '@/lib/data/job_class.json'

import Combobox from './Combobox.svelte'

let searchResults = $state<Record<string, any>>({})
let isReady = $state(false)
let { selected = $bindable() } = $props()

interface JobDocument {
  id: string
  label: string
  searchText: string
  hierarchy: {
    division: any
    group: {
      label: string
    }
    class: any
  }
  path: any[]
  parentContext: string
}

const index = new Document({
  document: {
    id: 'id',
    index: ['label', 'searchText'],
    store: true,
  },
  tokenize: 'forward',
  resolution: 3,
})

onMount(() => {
  for (const job of data) {
    const enhancedJob = {
      ...job,
      parentContext: job.path.slice(0, -1).join(' > '),
    }
    index.add(job.id, enhancedJob)
  }

  isReady = true
})

interface JobDocument {
  id: string
  label: string
  searchText: string
  hierarchy: {
    division: any
    group: {
      label: string
    }
    class: any
  }
  path: any[]
  parentContext: string
}

function groupResultsByGroup(searchResults: (DocumentData | null)[]) {
  const grouped: Record<string, Array<{ id: string; label: string }>> = {}

  for (const result of searchResults) {
    if (!result) {
      continue
    }

    const job = result as unknown as JobDocument

    if (!job.hierarchy?.group?.label) {
      continue
    }

    const groupLabel = job.hierarchy.group.label
    if (!grouped[groupLabel]) {
      grouped[groupLabel] = []
    }

    grouped[groupLabel].push({
      id: job.id,
      label: job.label,
    })
  }

  return grouped
}

const searchJob = async (
  query: string,
): Promise<Record<string, Array<{ id: string; label: string }>>> => {
  try {
    const results = index.search(query, {
      limit: 20,
      enrich: true,
    })

    const allDocs = []
    const seenIds = new Set()

    for (const fieldResult of results) {
      for (const item of fieldResult.result) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id)
          allDocs.push(item.doc)
        }
      }
    }

    const groupedResults = groupResultsByGroup(allDocs)

    searchResults = groupedResults
  } catch (error) {
    console.error('Search error:', error)
    searchResults = {}
  }

  return searchResults
}
</script>

<Combobox
  inputLabel={'Need a translation'}
  searchFunction={searchJob}
  onSelectedChange={({ next }) => (selected = next?.value)}
  showGroupHeaders
/>
