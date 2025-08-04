// src/lib/stores/resource.store.svelte.ts
import { SvelteMap } from 'svelte/reactivity'

type Id = string
type State = 'idle' | 'loading' | 'ready' | 'syncing' | 'error'

type Meta = {
  state: 'stable' | 'pending' | 'error'
  error?: string
  lastSync?: number
}

export type FetchList<T> = (cursor?: string) => Promise<{ items: T[]; next?: string }>
export type CreateFn<T> = (data: Partial<T>, opts?: unknown) => Promise<T>
export type UpdateFn<T> = (id: Id, patch: Partial<T>, opts?: unknown) => Promise<T>
export type RemoveFn = (id: Id, opts?: unknown) => Promise<void>

export type ResourceStore<T extends { id: Id }> = {
  // state
  get items(): T[]
  get ids(): Id[]
  get isLoading(): boolean
  get isSyncing(): boolean
  get canLoadMore(): boolean

  // ops
  init(opts?: { paginate?: boolean }): Promise<void>
  refresh(): Promise<void>
  loadMore(): Promise<void>
  getById(id: Id): T | undefined
  create(data: Partial<T>, opts?: unknown): Promise<T>
  update(id: Id, patch: Partial<T>, opts?: unknown): Promise<T>
  remove(id: Id, opts?: unknown): Promise<void>
  retryEntity(id: Id): Promise<void>
  invalidate(scope?: 'session' | 'resource'): void

  // infinite scroll helper
  makePrefetchObserver(node: Element): () => void
}

export function defineResource<T extends { id: Id }>(cfg: {
  name: string
  ttlMs?: number
  fetchList: FetchList<T>
  create?: CreateFn<T>
  update?: UpdateFn<T>
  remove?: RemoveFn
  sessionKey: () => string
}): () => ResourceStore<T> {
  // one instance per session+name
  const stores = new Map<string, ResourceStore<T>>()

  return function useResource() {
    const key = `${cfg.name}:${cfg.sessionKey()}`
    const existing = stores.get(key)
    if (existing) return existing

    // cache
    const items = new SvelteMap<Id, T>()
    const meta = new SvelteMap<Id, Meta>()
    let ids: Id[] = []
    let next: string | undefined
    let state: State = 'idle'
    let lastAt = 0

    // concurrency
    const inflight = new Set<AbortController>()
    function guard<R>(fn: (ac: AbortController) => Promise<R>) {
      const ac = new AbortController()
      inflight.add(ac)
      return fn(ac).finally(() => inflight.delete(ac))
    }
    function abortAll() {
      for (const c of inflight) c.abort()
      inflight.clear()
    }

    // helpers
    const ttl = cfg.ttlMs ?? 120_000
    const isStale = () => Date.now() - lastAt > ttl
    const setMeta = (id: Id, m: Partial<Meta>) => {
      const prev = meta.get(id) ?? { state: 'stable' as const }
      meta.set(id, { ...prev, ...m })
    }
    function merge(list: T[]) {
      for (const it of list) {
        if (!items.has(it.id)) ids.push(it.id)
        items.set(it.id, it)
        setMeta(it.id, { state: 'stable', lastSync: Date.now(), error: undefined })
      }
    }

    // init de-dupe
    let initP: Promise<void> | null = null
    // in src/lib/stores/resource.store.svelte.ts

    // in src/lib/stores/resource.store.svelte.ts

    async function init() {
      if (state === 'ready' && !isStale()) return
      if (initP) return initP

      state = state === 'idle' ? 'loading' : 'syncing'

      initP = guard(async (ac) => {
        // Declare 'res' here so it's accessible throughout the function
        let res: { items: T[]; next?: string }

        try {
          res = await cfg.fetchList(undefined)
          if (ac.signal.aborted) return
        } catch (error) {
          state = 'error'
          // Re-throw the error to be caught by the outer .catch
          throw error
        }

        // The data is now safe to process
        ids = []
        items.clear()
        merge(res.items)

        next = res.next
        lastAt = Date.now()
        state = 'ready'
      })
        .catch(() => {
          // This will catch errors from the fetch or other parts of the promise
          state = 'error'
        })
        .finally(() => {
          initP = null
        })
      return initP
    }
    async function refresh() {
      state = state === 'idle' ? 'loading' : 'syncing'
      return guard(async (ac) => {
        const res = await cfg.fetchList(undefined)
        if (ac.signal.aborted) return
        ids = []
        items.clear()
        merge(res.items)
        next = res.next
        lastAt = Date.now()
        state = 'ready'
      }).catch(() => {
        state = 'error'
      })
    }

    async function loadMore() {
      if (!next || state === 'loading' || inflight.size) return
      return guard(async (ac) => {
        const res = await cfg.fetchList(next)
        if (ac.signal.aborted) return
        merge(res.items)
        next = res.next
        lastAt = Date.now()
      })
    }

    function getById(id: Id) {
      return items.get(id)
    }

    async function create(data: Partial<T>, opts?: unknown) {
      if (!cfg.create) throw new Error('create not supported')
      const tempId = crypto.randomUUID()
      const draft = { ...(data as any), id: tempId } as T
      items.set(tempId, draft)
      ids.unshift(tempId)
      setMeta(tempId, { state: 'pending' })
      try {
        const saved = await cfg.create(data, opts)
        items.delete(tempId)
        items.set(saved.id, saved)
        ids = [saved.id, ...ids.filter((x) => x !== tempId)]
        setMeta(saved.id, { state: 'stable', lastSync: Date.now(), error: undefined })
        return saved
      } catch (e) {
        items.delete(tempId)
        ids = ids.filter((x) => x !== tempId)
        setMeta(tempId, { state: 'error', error: String(e) })
        throw e
      }
    }

    async function update(id: Id, patch: Partial<T>, opts?: unknown) {
      if (!cfg.update) throw new Error('update not supported')
      const prev = items.get(id)
      if (prev) {
        items.set(id, { ...prev, ...patch })
        setMeta(id, { state: 'pending' })
      }
      try {
        const saved = await cfg.update(id, patch, opts)
        items.set(id, saved)
        setMeta(id, { state: 'stable', lastSync: Date.now(), error: undefined })
        return saved
      } catch (e) {
        if (prev) items.set(id, prev)
        setMeta(id, { state: 'error', error: String(e) })
        throw e
      }
    }

    async function remove(id: Id, opts?: unknown) {
      if (!cfg.remove) throw new Error('remove not supported')
      const prev = items.get(id)
      items.delete(id)
      ids = ids.filter((x) => x !== id)
      try {
        await cfg.remove(id, opts)
      } catch (e) {
        if (prev) {
          items.set(id, prev)
          ids.unshift(id)
          setMeta(id, { state: 'error', error: String(e) })
        }
        throw e
      }
    }

    async function retryEntity(id: Id) {
      const m = meta.get(id)
      if (!m || m.state !== 'error') return
      return refresh()
    }

    function invalidate(scope: 'session' | 'resource' = 'resource') {
      abortAll()
      if (scope === 'session') {
        // keep cache, force stale
      }
      lastAt = 0
    }

    function makePrefetchObserver(node: Element) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) loadMore()
      })
      io.observe(node)
      return () => io.disconnect()
    }

    const store: ResourceStore<T> = {
      get items() {
        return Array.from(items.values())
      },
      get ids() {
        return ids
      },
      get isLoading() {
        return state === 'loading'
      },
      get isSyncing() {
        return state === 'syncing'
      },
      get canLoadMore() {
        return !!next && state !== 'loading'
      },

      init,
      refresh,
      loadMore,
      getById,
      create,
      update,
      remove,
      retryEntity,
      invalidate,
      makePrefetchObserver,
    }

    stores.set(key, store)
    return store
  }
}
