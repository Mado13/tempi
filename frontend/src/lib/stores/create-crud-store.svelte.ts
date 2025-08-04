// src/lib/stores/create-crud-store.svelte.ts
import { SvelteMap } from 'svelte/reactivity'
import { v4 as uuidv4 } from 'uuid'

import { type ApiResult, api } from '$lib/api'
import { getErrorMessage } from '$lib/i18n/errors.svelte'

type StoreState = 'idle' | 'loading' | 'syncing' | 'error'

// ------- Global invalidation (session/role scoped) -------
let globalEpoch = 0
const storeInstances = new Set<any>()

export function invalidateAllStores() {
  globalEpoch++
  for (const store of storeInstances) store.invalidate()
}

export function unregisterStore(store: any) {
  storeInstances.delete(store)
}

// ------- Store factory -------
export function createCrudStore<TCreate extends Record<string, any>>(resource: string) {
  type TWithId = TCreate & { id: string }

  const items = new SvelteMap<string, TWithId>()
  let state = $state<StoreState>('idle')
  let lastError = $state<ApiResult<any> | null>(null)
  let isInitialized = $state(false)
  let initPromise: Promise<void> | null = null

  // epoch
  let localEpoch = globalEpoch

  // pagination
  let nextCursor = $state<string | null>(null)
  let hasMore = $state(true)
  let isLoadingMore = $state(false)
  let paginationEnabled = $state(false)

  // derived
  const itemsArray = $derived(Array.from(items.values()))
  let lastUpdated = $state<Date | null>(null)

  function clearError() {
    lastError = null
  }

  // hard reset on role switch
  function invalidate() {
    isInitialized = false
    localEpoch = globalEpoch
    items.clear()
    nextCursor = null
    hasMore = true
    isLoadingMore = false
    paginationEnabled = false
    lastUpdated = null
    state = 'idle'
    lastError = null
  }

  async function init(options?: { limit?: number; paginate?: boolean }): Promise<void> {
    if (isInitialized) return
    if (localEpoch !== globalEpoch) {
      localEpoch = globalEpoch
    }
    const startEpoch = localEpoch
    const p = _performInit(options, startEpoch)
    initPromise = p
    try {
      await p
    } finally {
      if (initPromise === p) initPromise = null
    }
  }

  async function _performInit(
    options: { limit?: number; paginate?: boolean } | undefined,
    startEpoch: number,
  ): Promise<void> {
    state = 'loading'
    clearError()
    paginationEnabled = !!options?.paginate

    if (paginationEnabled) {
      const result = await api.get<{ data: TWithId[]; nextCursor: string | null }>(
        `/${resource}/`,
        {
          params: { limit: options?.limit ?? 30 },
          snackbar: false,
        },
      )

      if (startEpoch !== globalEpoch) {
        state = 'idle'
        return
      }

      if (!result.success || !result.data) {
        lastError = result
        state = 'error'
        return
      }

      const { data: list, nextCursor: cursor } = result.data
      items.clear()
      for (const it of list) items.set(it.id, it)
      nextCursor = cursor
      hasMore = !!cursor
      isInitialized = true
      lastUpdated = new Date()
      state = 'idle'
    } else {
      const result = await api.get<TWithId[]>(`/${resource}/`, { snackbar: false })

      if (startEpoch !== globalEpoch) {
        state = 'idle'
        return
      }

      if (!result.success || !result.data) {
        lastError = result
        state = 'error'
        return
      }

      const list = result.data
      items.clear()
      for (const it of list) items.set(it.id, it)
      isInitialized = true
      lastUpdated = new Date()
      state = 'idle'
    }
  }

  async function refresh(): Promise<ApiResult<TWithId[]>> {
    if (localEpoch !== globalEpoch || !isInitialized) {
      isInitialized = false
      localEpoch = globalEpoch
      items.clear()
      nextCursor = null
      hasMore = true
      await init()
      return { success: true, statusCode: 200, data: itemsArray }
    }

    if (paginationEnabled) {
      nextCursor = null
      hasMore = true
      isInitialized = false
      await init({ paginate: true })
      return { success: true, statusCode: 200, data: itemsArray }
    }

    const startEpoch = localEpoch
    state = 'syncing'
    clearError()

    const result = await api.get<TWithId[]>(`/${resource}/`, { snackbar: false })

    if (startEpoch !== globalEpoch) {
      state = 'idle'
      return { success: false, statusCode: 409, error: 'STALE_RESPONSE' }
    }

    if (result.success && result.data) {
      const list = result.data
      items.clear()
      for (const it of list) items.set(it.id, it)
      lastUpdated = new Date()
      state = 'idle'
    } else {
      lastError = result
      state = 'error'
    }

    return result
  }

  function refreshIfStale(maxAgeMs = 60_000) {
    const staleByTime = !lastUpdated || Date.now() - lastUpdated.getTime() > maxAgeMs
    const staleByEpoch = localEpoch !== globalEpoch || !isInitialized
    if (staleByTime || staleByEpoch) {
      return refresh()
    }
    return { success: true, statusCode: 204, data: itemsArray }
  }

  async function create(
    itemData: TCreate,
    options?: { snackbar?: string | false },
  ): Promise<ApiResult<TWithId>> {
    const startEpoch = localEpoch
    const tempId = uuidv4()
    const tempItem = { ...itemData, id: tempId } as TWithId

    items.set(tempId, tempItem)
    clearError()

    const result = await api.post<TWithId>(`/${resource}/`, itemData, {
      resource,
      snackbar: options?.snackbar,
    })

    if (startEpoch !== globalEpoch) {
      items.delete(tempId)
      return { success: false, statusCode: 409, error: 'STALE_RESPONSE' }
    }

    if (result.success && result.data) {
      items.delete(tempId)
      items.set(result.data.id, result.data)
    } else {
      items.delete(tempId)
      lastError = result
    }

    return result
  }

  async function update(id: string, updates: Partial<TCreate>): Promise<ApiResult<TWithId>> {
    const startEpoch = localEpoch
    const originalItem = items.get(id)
    if (!originalItem) {
      const notFoundResult: ApiResult<TWithId> = {
        success: false,
        error: getErrorMessage('ITEM_NOT_FOUND'),
        statusCode: 404,
      }
      lastError = notFoundResult
      return notFoundResult
    }

    const updatedItem = { ...originalItem, ...updates } as TWithId
    items.set(id, updatedItem)
    clearError()

    const result = await api.put<TWithId>(`/${resource}/${id}/`, updates, { resource })

    if (startEpoch !== globalEpoch) {
      items.set(id, originalItem)
      return { success: false, statusCode: 409, error: 'STALE_RESPONSE' }
    }

    if (!result.success) {
      items.set(id, originalItem)
      lastError = result
    } else if (result.data) {
      items.set(id, result.data)
    }

    return result
  }

  async function remove(id: string): Promise<ApiResult<void>> {
    const startEpoch = localEpoch
    const itemToDelete = items.get(id)
    if (!itemToDelete) {
      const notFoundResult: ApiResult<void> = {
        success: false,
        error: getErrorMessage('ITEM_NOT_FOUND'),
        statusCode: 404,
      }
      lastError = notFoundResult
      return notFoundResult
    }

    items.delete(id)
    clearError()

    const result = await api.delete(`/${resource}/${id}/`, { resource })

    if (startEpoch !== globalEpoch) {
      items.set(id, itemToDelete)
      return { success: false, statusCode: 409, error: 'STALE_RESPONSE' }
    }

    if (!result.success) {
      items.set(id, itemToDelete)
      lastError = result
    }

    return result
  }

  async function loadMore(): Promise<ApiResult<TWithId[]>> {
    if (!paginationEnabled || !hasMore || isLoadingMore || !nextCursor) {
      return { success: false, error: getErrorMessage('CANT_LOAD_MORE'), statusCode: 400 }
    }

    const startEpoch = localEpoch
    isLoadingMore = true
    clearError()

    const result = await api.get<{ data: TWithId[]; nextCursor: string | null }>(`/${resource}/`, {
      params: { cursor: nextCursor, limit: 30 },
      snackbar: false,
    })

    isLoadingMore = false

    if (startEpoch !== globalEpoch) {
      return { success: false, statusCode: 409, error: 'STALE_RESPONSE' }
    }

    if (!result.success || !result.data) {
      lastError = result
      return {
        success: false,
        error: result.error,
        errors: result.errors,
        statusCode: result.statusCode,
      }
    }

    const { data: list, nextCursor: cursor } = result.data
    for (const it of list) items.set(it.id, it)
    nextCursor = cursor
    hasMore = !!cursor

    return { success: true, data: list, statusCode: result.statusCode }
  }

  // queries
  function getById(id: string): TWithId | undefined {
    return items.get(id)
  }
  function find(predicate: (item: TWithId) => boolean): TWithId | undefined {
    return Array.from(items.values()).find(predicate)
  }
  function filter(predicate: (item: TWithId) => boolean): TWithId[] {
    return Array.from(items.values()).filter(predicate)
  }
  function count(): number {
    return items.size
  }

  // renamed to avoid collisions; exported as destroy
  function teardown() {
    items.clear()
    isInitialized = false
    state = 'idle'
    lastError = null
    initPromise = null
    nextCursor = null
    hasMore = true
    isLoadingMore = false
    paginationEnabled = false
    lastUpdated = null
  }

  const store = {
    // state (booleans, not reactive refs)
    get itemsMap() {
      return items
    },
    get size() {
      return items.size
    },
    get items() {
      return itemsArray
    },
    get state() {
      return state
    },
    get isLoading() {
      return state === 'loading'
    },
    get isSyncing() {
      return state === 'syncing'
    },
    get hasError() {
      return !!lastError
    },
    get isReady() {
      return isInitialized && state !== 'loading'
    },
    get error() {
      return lastError
    },
    get isInitialized() {
      return isInitialized
    },
    get hasValidationErrors() {
      return lastError?.errors ? Object.keys(lastError.errors).length > 0 : false
    },
    get isNetworkError() {
      return lastError?.isNetworkError || false
    },
    get hasMore() {
      return hasMore
    },
    get isLoadingMore() {
      return isLoadingMore
    },
    get canLoadMore() {
      return paginationEnabled && hasMore && !isLoadingMore
    },
    get lastUpdated() {
      return lastUpdated
    },
    get timeSinceUpdate() {
      if (!lastUpdated) return null
      return Date.now() - lastUpdated.getTime()
    },

    // actions
    init,
    refresh,
    refreshIfStale,
    create,
    update,
    remove,
    loadMore,
    destroy: teardown,
    clearError,
    getById,
    find,
    filter,
    count,
    invalidate,

    _itemType: null as any as TWithId,
  }

  storeInstances.add(store)
  return store
}

export type ItemType<T> = T extends { _itemType: infer U } ? U : never
