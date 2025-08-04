// src/lib/stores/rest-resource.svelte.ts
import { api } from '$lib/api'

import {
  type CreateFn,
  type RemoveFn,
  type UpdateFn,
  defineResource,
} from './resource.store.svelte'

type ListResponse<T> =
  | T[] // plain array
  | { data: T[]; nextCursor?: string | null } // Phoenix-ish
  | { items: T[]; next?: string | null } // alt shape

type CallOpts = { snackbar?: false | string }

type RestOpts = {
  ttlMs?: number
  limit?: number
  sessionKey: () => string
  snackbar?: {
    create?: string
    update?: string
    remove?: string
  }
  path?: string
  usePutForUpdate?: boolean
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

  // Type the functions properly
  const createFn: CreateFn<T> = async (data: Partial<T>, opts?: unknown) => {
    const callOpts = opts as CallOpts | undefined
    const res = await api.post<T>(path, data, {
      snackbar:
        typeof callOpts?.snackbar === 'string'
          ? callOpts.snackbar
          : callOpts?.snackbar === false
            ? false
            : (snackbar.create ?? false),
    })
    if (!res.success || !res.data) throw new Error(res.error ?? 'Create failed')
    return res.data
  }

  const updateFn: UpdateFn<T> = async (id: string, patch: Partial<T>, opts?: unknown) => {
    const callOpts = opts as CallOpts | undefined
    const url = `${path}${id}/`
    const call = usePutForUpdate ? api.put<T> : api.patch<T>
    const res = await call(url, patch, {
      snackbar:
        typeof callOpts?.snackbar === 'string'
          ? callOpts.snackbar
          : callOpts?.snackbar === false
            ? false
            : (snackbar.update ?? false),
    })
    if (!res.success || !res.data) throw new Error(res.error ?? 'Update failed')
    return res.data
  }

  const removeFn: RemoveFn = async (id: string, opts?: unknown) => {
    const callOpts = opts as CallOpts | undefined
    const res = await api.delete(`${path}${id}/`, {
      snackbar:
        typeof callOpts?.snackbar === 'string'
          ? callOpts.snackbar
          : callOpts?.snackbar === false
            ? false
            : (snackbar.remove ?? false),
    })
    if (!res.success) throw new Error(res.error ?? 'Delete failed')
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
    create: createFn,
    update: updateFn,
    remove: removeFn,
  })
}
