// src/lib/stores/rest-resource.svelte.ts
import { api } from '$lib/api'

import { defineResource } from './resource.store.svelte'

type ListResponse<T> =
  | T[] // plain array
  | { data: T[]; nextCursor?: string | null } // Phoenix-ish
  | { items: T[]; next?: string | null } // alt shape

type RestOpts = {
  ttlMs?: number
  limit?: number
  sessionKey: () => string
  snackbar?: {
    create?: string | false
    update?: string | false
    remove?: string | false
  }
  // If your endpoints deviate a bit
  path?: string // defaults to `/${name}/`
  usePutForUpdate?: boolean // default: PATCH
}

export function defineRestResource<T extends { id: string }>(name: string, opts: RestOpts) {
  const {
    ttlMs = 90_000,
    limit = 30,
    sessionKey,
    snackbar = {},
    path = `/${name}/`,
    usePutForUpdate = false,
  } = opts

  function norm<TItem>(raw: ListResponse<TItem>): { items: TItem[]; next?: string } {
    if (Array.isArray(raw)) return { items: raw }
    if ('items' in raw) return { items: raw.items ?? [], next: raw.next ?? undefined }
    if ('data' in raw) return { items: raw.data ?? [], next: raw.nextCursor ?? undefined }
    return { items: [] }
  }

  return defineResource<T>({
    name,
    ttlMs,
    sessionKey,

    async fetchList(cursor?: string) {
      const params = cursor ? { cursor, limit } : { limit }
      const res = await api.get<ListResponse<T>>(path, { params, snackbar: false })
      if (!res.success || res.data == null) return { items: [], next: undefined }
      const { items, next } = norm<T>(res.data)
      return { items, next }
    },

    async create(data: Partial<T>) {
      const res = await api.post<T>(path, data, {
        snackbar: snackbar.create ?? false,
      })
      if (!res.success || !res.data) throw new Error(res.error ?? 'Create failed')
      return res.data
    },

    async update(id: string, patch: Partial<T>) {
      const url = `${path}${id}/`
      const call = usePutForUpdate ? api.put<T> : api.patch<T>
      const res = await call(url, patch, {
        snackbar: snackbar.update ?? false,
      })
      if (!res.success || !res.data) throw new Error(res.error ?? 'Update failed')
      return res.data
    },

    async remove(id: string) {
      const res = await api.delete(`${path}${id}/`, {
        snackbar: snackbar.remove ?? false,
      })
      if (!res.success) throw new Error(res.error ?? 'Delete failed')
    },
  })
}
