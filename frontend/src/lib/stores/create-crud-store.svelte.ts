// src/lib/stores/create-crud-store.svelte.ts
import { SvelteMap } from 'svelte/reactivity'
import { v4 as uuidv4 } from 'uuid'

import { type ApiResult, api } from '$lib/api'
import { getErrorMessage } from '$lib/i18n/errors.svelte'

type StoreState = 'idle' | 'loading' | 'syncing' | 'error'

export function createCrudStore<TCreate extends Record<string, any>>(resource: string) {
  type TWithId = TCreate & { id: string }

  const items = new SvelteMap<string, TWithId>()
  let state = $state<StoreState>('idle')
  let lastError = $state<ApiResult<any> | null>(null)
  let isInitialized = $state(false)
  let initPromise: Promise<void> | null = null

  // Pagination states
  let nextCursor = $state<string | null>(null)
  let hasMore = $state(true)
  let isLoadingMore = $state(false)
  let paginationEnabled = $state(false)

  // Derived values are automatically reactive with SvelteMap
  const isLoading = $derived(state === 'loading')
  const isSyncing = $derived(state === 'syncing')
  const hasError = $derived(!!lastError)
  const isReady = $derived(isInitialized && state !== 'loading')
  const itemsArray = $derived(Array.from(items.values()))
  let lastUpdated = $state<Date | null>(null)

  function clearError() {
    lastError = null
  }

  async function init(options?: { limit?: number; paginate?: boolean }): Promise<void> {
    if (isInitialized) {
      return
    }
    if (initPromise) {
      return initPromise
    }

    initPromise = _performInit(options)
    try {
      await initPromise
    } finally {
      initPromise = null
    }
  }

  async function _performInit(options?: { limit?: number; paginate?: boolean }): Promise<void> {
    state = 'loading'
    clearError()

    paginationEnabled = options?.paginate || false

    if (paginationEnabled) {
      const result = await api.get<{ data: TWithId[]; nextCursor: string | null }>(
        `/${resource}/`,
        { params: { limit: options?.limit || 30 }, snackbar: false },
      )

      if (result.success && result.data) {
        items.clear()
        result.data.data.forEach((item) => items.set(item.id, item))
        nextCursor = result.data.nextCursor
        hasMore = !!nextCursor
        isInitialized = true
        lastUpdated = new Date()
        state = 'idle'
      } else {
        lastError = result
        state = 'error'
      }
    } else {
      const result = await api.get<TWithId[]>(`/${resource}/`, {
        snackbar: false,
      })

      if (result.success && result.data) {
        items.clear()
        result.data.forEach((item) => items.set(item.id, item))
        isInitialized = true
        lastUpdated = new Date()
        state = 'idle'
      } else {
        lastError = result
        state = 'error'
      }
    }
  }

  async function refresh(): Promise<ApiResult<TWithId[]>> {
    if (!isInitialized) {
      await init()
      return { success: true, statusCode: 200, data: itemsArray }
    }

    if (paginationEnabled) {
      nextCursor = null
      hasMore = true
      return { success: true, statusCode: 200, data: itemsArray }
    } else {
      state = 'syncing'
      clearError()

      const result = await api.get<TWithId[]>(`/${resource}/`, {
        snackbar: false,
      })

      if (result.success && result.data) {
        items.clear()
        result.data.forEach((item) => items.set(item.id, item))
        lastUpdated = new Date()
        state = 'idle'
      } else {
        lastError = result
        state = 'error'
      }

      return result
    }
  }

  async function create(
    itemData: TCreate,
    options?: { snackbar?: string | false },
  ): Promise<ApiResult<TWithId>> {
    const tempId = uuidv4()
    const tempItem = { ...itemData, id: tempId } as TWithId

    items.set(tempId, tempItem)
    clearError()

    const result = await api.post<TWithId>(`/${resource}/`, itemData, {
      resource,
      snackbar: options?.snackbar,
    })

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

    if (!result.success) {
      items.set(id, originalItem)
      lastError = result
    } else if (result.data) {
      items.set(id, result.data)
    }

    return result
  }

  async function remove(id: string): Promise<ApiResult<void>> {
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

    isLoadingMore = true
    clearError()

    const result = await api.get<{ data: TWithId[]; nextCursor: string | null }>(`/${resource}/`, {
      params: { cursor: nextCursor, limit: 30 },
      snackbar: false,
    })

    isLoadingMore = false // Move here - always set it back

    if (result.success && result.data) {
      result.data.data.forEach((item) => items.set(item.id, item))
      nextCursor = result.data.nextCursor
      hasMore = !!nextCursor

      return {
        success: true,
        data: result.data.data,
        statusCode: result.statusCode,
      }
    } else {
      lastError = result
      return {
        success: false,
        error: result.error,
        errors: result.errors,
        statusCode: result.statusCode,
      }
    }
  }

  function destroy() {
    items.clear()
    isInitialized = false
    state = 'idle'
    lastError = null
    initPromise = null
  }

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

  return {
    // State - using derived for items array to be reactive
    get itemsMap() {
      return items
    },
    get size() {
      return items.size
    },
    get items() {
      return Array.from(items.values())
    },
    get state() {
      return state
    },
    get isLoading() {
      return isLoading
    },
    get isSyncing() {
      return isSyncing
    },
    get hasError() {
      return hasError
    },
    get isReady() {
      return isReady
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
    init,
    refresh,
    create,
    update,
    remove,
    loadMore,
    destroy,
    clearError,
    getById,
    find,
    filter,
    count,
    _itemType: null as any as TWithId,
  }
}

export type ItemType<T> = T extends { _itemType: infer U } ? U : never
