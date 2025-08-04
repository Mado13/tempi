// supabase-storage.adapter.svelte.ts
import type { SupabaseClient } from '@supabase/supabase-js'

import type { ImageTransform, StorageProvider } from '$lib/services/file-storage.service.svelte'

class StorageError extends Error {
  code?: string
  cause?: unknown
  constructor(message: string, opts?: { code?: string; cause?: unknown }) {
    super(message)
    this.code = opts?.code
    this.cause = opts?.cause
  }
}

type GetClient = () => SupabaseClient
type EnsureToken = () => Promise<string | null>

// Overload: support legacy (2 args) and new (1 arg)
export function makeSupabaseStorageAdapter(getClient: GetClient): StorageProvider & {
  getUrl(
    bucket: string,
    path: string,
    expiresIn: number,
    options?: { transform?: ImageTransform },
  ): Promise<string>
}
export function makeSupabaseStorageAdapter(
  getClient: GetClient,
  _ensureToken?: EnsureToken,
): StorageProvider & {
  getUrl(
    bucket: string,
    path: string,
    expiresIn: number,
    options?: { transform?: ImageTransform },
  ): Promise<string>
}
export function makeSupabaseStorageAdapter(getClient: GetClient, _ensureToken?: EnsureToken) {
  // helper: legacy no-op
  const ensure = _ensureToken ?? (async () => null)

  return {
    async upload(bucketName: string, fileName: string, file: Blob) {
      // if old code passes a real ensureToken, we still await it; otherwise no-op
      await ensure()
      const { data, error } = await getClient()
        .storage.from(bucketName)
        .upload(fileName, file, { upsert: false })
      if (error || !data)
        throw new StorageError(error?.message || 'upload failed', { code: 'upload_failed' })
      return { data: { path: data.path, id: (data as any).id ?? data.path } }
    },

    async download(bucketName: string, path: string, options?: { transform?: ImageTransform }) {
      const { data, error } = await getClient().storage.from(bucketName).download(path)
      if (error || !data)
        throw new StorageError(error?.message || 'download failed', { code: 'download_failed' })
      return { data }
    },

    async createSignedUrl(
      bucketName: string,
      path: string,
      expiresIn: number,
      options?: { transform?: ImageTransform },
    ) {
      await ensure()
      const { data, error } = await getClient()
        .storage.from(bucketName)
        .createSignedUrl(path, expiresIn, options as any)
      if (error || !data)
        throw new StorageError(error?.message || 'sign failed', { code: 'sign_failed' })
      return { data: { signedUrl: (data as any).signedUrl } }
    },

    async remove(bucketName: string, paths: string[]) {
      await ensure()
      const { error } = await getClient().storage.from(bucketName).remove(paths)
      if (error) throw new StorageError(error.message || 'remove failed', { code: 'remove_failed' })
      return {}
    },

    async list(bucketName: string, options?: { prefix?: string }) {
      await ensure()
      const { data, error } = await getClient()
        .storage.from(bucketName)
        .list(options?.prefix ?? '', { limit: 1000 })
      if (error || !data)
        throw new StorageError(error?.message || 'list failed', { code: 'list_failed' })
      return {
        data: data.map((f) => ({
          name: f.name,
          metadata: { size: f.metadata?.size as number | undefined },
        })),
      }
    },

    async getUrl(
      bucketName: string,
      path: string,
      expiresIn: number,
      options?: { transform?: ImageTransform },
    ) {
      await ensure()
      const { data, error } = await getClient()
        .storage.from(bucketName)
        .createSignedUrl(path, expiresIn, options as any)
      if (error || !data)
        throw new StorageError(error?.message || 'sign failed', { code: 'sign_failed' })
      return (data as any).signedUrl as string
    },
  }
}
