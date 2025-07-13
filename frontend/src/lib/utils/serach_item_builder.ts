// utils/searchItemsBuilder.ts
import type { Item, JobDocument } from '$lib/types/job'

interface SearchItemsBuilderOptions {
  searchResults: Record<string, JobDocument[]>
  selectedItems: Record<string, any>
  allData: JobDocument[]
  selectedGroupLabel?: string
}

// utils/searchItemsBuilder.ts
export function buildSearchItems({
  searchResults,
  selectedItems,
  allData,
}: SearchItemsBuilderOptions): Item[] {
  const items: Item[] = []

  // Transform search results
  for (const [group, docs] of Object.entries(searchResults)) {
    items.push(
      ...docs.map((doc) => ({
        id: doc.id,
        label: doc.label,
        context: doc.parentContext,
        group,
      })),
    )
  }

  // Fallback to selected items - preserve their original groups
  if (items.length === 0 && Object.keys(selectedItems).length > 0) {
    const dataMap = new Map(allData.map((job) => [job.id, job]))

    for (const [id, label] of Object.entries(selectedItems)) {
      const doc = dataMap.get(id)
      items.push({
        id,
        label: typeof label === 'string' ? label : label.label,
        context: doc?.parentContext || '',
        group: doc?.hierarchy.group.label || 'Other', // ← Use original group
      })
    }
  }

  return items
}
