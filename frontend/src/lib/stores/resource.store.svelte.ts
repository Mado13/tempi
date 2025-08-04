// src/lib/stores/resource.svelte.ts
import { SvelteMap } from 'svelte/reactivity'

type Id = string
type State = 'idle' | 'loading' | 'ready' | 'syncing' | 'error'
type Meta = { state: 'stable' | 'pending' | 'error'; error?: string; lastSync?: number }

type FetchList<T> = (cursor?: string) => Promise<{ items: T[]; next?: string }>
type Mut<T> = (arg: any) => Promise<T>

export type ResourceStore<T extends { id: Id }> = {
  // state (getters keep component usage simple)
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
  create(data: Partial<T>): Promise<T>
  update(id: Id, patch: Partial<T>): Promise<T>
  remove(id: Id): Promise<void>
  retryEntity(id: Id): Promise<void>
  invalidate(scope?: 'session' | 'resource'): void

  // optional: hook to wire an infinite-scroll sentinel
  makePrefetchObserver(node: Element): () => void
}

export function defineResource<T extends { id: Id }>(cfg: {
  name: string
  ttlMs?: number
  fetchList: FetchList<T>
  create?: Mut<T>
  update?: (id: Id, patch: Partial<T>) => Promise<T>
  remove?: (id: Id) => Promise<void>
  sessionKey: () => string // must reflect user + role
}): (key?: string) => ResourceStore<T> {
  const instances = new Map<string, string>() // sessionKey -> instanceKey
  const stores = new Map<string, ResourceStore<T>>()

  return function useResource(key?: string) {
    const session = cfg.sessionKey()
    const instanceKey = key ?? `${cfg.name}:${session}`

    const existing = stores.get(instanceKey)
    if (existing) return existing

    // cache
    const items = new SvelteMap<Id, T>()
    const meta = new SvelteMap<Id, Meta>()
    let ids: Id[] = []
    let next: string | undefined
    let state: State = 'idle'
    let lastAt = 0
    let paging = false

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
    const stale = () => Date.now() - lastAt > ttl
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
    async function init(opts?: { paginate?: boolean }) {
      if (state === 'ready' && !stale()) return
      if (initP) return initP
      paging = !!opts?.paginate
      state = state === 'idle' ? 'loading' : 'syncing'
      initP = guard(async (ac) => {
        const res = await cfg.fetchList(undefined)
        if (ac.signal.aborted) return
        ids = []
        items.clear()
        merge(res.items)
        next = res.next
        lastAt = Date.now()
        state = 'ready'
      })
        .catch(() => {
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
        // merge (no flash)
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

    async function create(data: Partial<T>) {
      if (!cfg.create) throw new Error('create not supported')
      const tempId = crypto.randomUUID()
      const draft = { ...(data as any), id: tempId } as T
      items.set(tempId, draft)
      ids.unshift(tempId)
      setMeta(tempId, { state: 'pending' })
      try {
        const saved = await cfg.create(data)
        items.delete(tempId)
        items.set(saved.id, saved)
        ids = [saved.id, ...ids.filter((x) => x !== tempId)]
        setMeta(saved.id, { state: 'stable', lastSync: Date.now(), error: undefined })
        return saved
      } catch (e: any) {
        items.delete(tempId)
        ids = ids.filter((x) => x !== tempId)
        return Promise.reject(e)
      }
    }

    async function update(id: Id, patch: Partial<T>) {
      if (!cfg.update) throw new Error('update not supported')
      const prev = items.get(id)
      if (prev) {
        items.set(id, { ...prev, ...patch })
        setMeta(id, { state: 'pending' })
      }
      try {
        const saved = await cfg.update(id, patch)
        items.set(id, saved)
        setMeta(id, { state: 'stable', lastSync: Date.now(), error: undefined })
        return saved
      } catch (e: any) {
        if (prev) items.set(id, prev)
        setMeta(id, { state: 'error', error: String(e) })
        return Promise.reject(e)
      }
    }

    async function remove(id: Id) {
      if (!cfg.remove) throw new Error('remove not supported')
      const prev = items.get(id)
      items.delete(id)
      ids = ids.filter((x) => x !== id)
      try {
        await cfg.remove(id)
      } catch (e: any) {
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
      // simple: re-fetch list; keeps code small
      return refresh()
    }

    function invalidate(scope: 'session' | 'resource' = 'resource') {
      abortAll()
      if (scope === 'session') {
        // soft reset; keep cache but mark stale
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

    instances.set(session, instanceKey)
    stores.set(instanceKey, store)
    return store
  }
}
