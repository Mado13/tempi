import { Document } from 'flexsearch'

import type { JobDocument } from '$lib/types/job'

import data from '../../../data/job_classifications.json'

/**
 * Enhance the raw data once when the module is first loaded.
 * This adds a `parentContext` string for better display in search results.
 */
const enhancedData: JobDocument[] = data.map((job) => ({
  ...job,
  parentContext: job.path.slice(0, -1).join(' > '),
}))

/**
 * A simple Map for extremely fast lookups by ID.
 * This is used to "translate" a classification ID from your backend into a full object.
 */
const classificationMap = new Map<string, JobDocument>(enhancedData.map((doc) => [doc.id, doc]))

/**
 * The FlexSearch document index for powerful fuzzy searching.
 * It indexes the `label` and the pre-built `searchText` field.
 */
const searchIndex = new Document({
  tokenize: 'forward',
  resolution: 3,
  document: {
    id: 'id',
    index: ['label', 'searchText'],
    store: ['id', 'label', 'hierarchy', 'parentContext'],
  },
})

// Add every document to the search index.
enhancedData.forEach((doc) => {
  searchIndex.add(doc)
})

// --- EXPORTED VALUES AND FUNCTIONS ---

/**
 * The complete, enhanced list of all job classifications.
 * Used by UI builders that need the entire dataset.
 */
export const allClassifications: JobDocument[] = enhancedData

/**
 * Performs a fuzzy search on job classifications.
 *
 * @param query The search string from the user.
 * @returns An array of matching job documents.
 */
export function searchClassifications(query: string): JobDocument[] {
  if (!query) {
    return []
  }

  // The `search` method with `enrich: true` returns a complex array of results per field.
  // We need to flatten and deduplicate these results.
  const searchResult = searchIndex.search(query, { limit: 20, enrich: true })

  const seenIds = new Set<string>()
  const docs: JobDocument[] = []

  searchResult.forEach((fieldResult) => {
    fieldResult.result.forEach((r: any) => {
      if (!seenIds.has(r.id)) {
        seenIds.add(r.id)
        docs.push(r.doc)
      }
    })
  })

  return docs
}

/**
 * Translates a classification ID to the full document object.
 *
 * @param id The classification ID (e.g., "111").
 * @returns The full job document or `undefined` if not found.
 */
export function getClassificationById(id: string): JobDocument | undefined {
  return classificationMap.get(id)
}
