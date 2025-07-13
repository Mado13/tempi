// src/lib/stores/create-crud-store.svelte.ts
import { api } from '$lib/api'
import { dbService } from '$lib/services/database.service'
import { syncEvents, syncService } from '$lib/services/sync.service'

import type { AuthStore } from './contexts'

interface Identifiable {
  id: string
}

interface InitDependencies {
  authStore: AuthStore
}

export function createCrudStore<T extends Identifiable, R extends string>(resource: R) {
  let items = $state<T[]>([])
  let isLoading = $state(true)
  let isInitialized = $state(false)
  let isSyncing = $state(false)
  let error = $state<Error | null>(null)

  const handleSync = () => {
    if (!isInitialized) return
    fetchFromServer()
  }

  async function init(dependencies: InitDependencies) {
    if (isInitialized) return
    syncEvents.off(resource, handleSync)
    syncEvents.on(resource, handleSync)

    const { authStore } = dependencies
    if (!authStore.isAuthenticated) {
      items = []
      isLoading = false
      isInitialized = true
      return
    }

    items = await dbService.getAll<T>(resource)
    isLoading = false
    await syncService.processOutbox()
    await fetchFromServer()
    isInitialized = true
  }

  function destroy() {
    syncEvents.off(resource, handleSync)
    isInitialized = false
  }

  async function fetchFromServer() {
    if (isSyncing) return
    isSyncing = true
    error = null
    try {
      const result = await api.get<Record<R, T[]>>(`/${resource}`)
      if (result.success && result.data && result.data[resource]) {
        const itemsToSave = result.data[resource]
        await dbService.bulkSave(resource, itemsToSave)
        items = await dbService.getAll<T>(resource)
      } else {
        throw new Error(result.error || `Failed to fetch ${resource}`)
      }
    } catch (e: any) {
      console.error(`Failed to fetch ${resource}:`, e)
      error = e
    } finally {
      isSyncing = false
    }
  }

  return {
    get items() {
      return items
    },
    get isLoading() {
      return isLoading
    },
    get isInitialized() {
      return isInitialized
    },
    get error() {
      return error
    },
    init,
    destroy,
  }
}
