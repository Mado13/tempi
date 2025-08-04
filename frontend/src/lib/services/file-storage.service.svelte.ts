import type { createAuthStore } from '$lib/stores/create-auth-store.svelte'

export interface FileUploadResult {
  key: string
  id: string
  previewUrl?: string
}

export interface ImageTransform {
  width?: number
  height?: number
  quality?: number // 20..100, default 80
  resize?: 'cover' | 'contain' | 'fill'
  format?: 'origin' // opt-out of auto-webp
}

export interface StorageProvider {
  upload(
    bucketName: string,
    fileName: string,
    file: Blob,
  ): Promise<{ data?: { path: string; id: string } }>
  download(
    bucketName: string,
    path: string,
    options?: { transform?: ImageTransform },
  ): Promise<{ data?: Blob }>
  createSignedUrl(
    bucketName: string,
    path: string,
    expiresIn: number,
    options?: { transform?: ImageTransform },
  ): Promise<{ data?: { signedUrl: string } }>
  remove(bucketName: string, paths: string[]): Promise<{}>
  list(
    bucketName: string,
    options?: { prefix?: string },
  ): Promise<{ data?: Array<{ name: string; metadata?: { size?: number } }> }>
}

export interface FileUploadOptions {
  maxSizeBytes?: number
  allowedTypes?: string[]
  filePrefix?: string
  quality?: number
  checkDuplicates?: 'none' | 'content-hash'
}

type AuthStore = ReturnType<typeof createAuthStore>

export function createFileStorageService(
  bucketName: string,
  storage: StorageProvider,
  authStore: AuthStore,
  options: FileUploadOptions = {},
) {
  const {
    maxSizeBytes = 5 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    filePrefix = 'file',
    quality = 90,
    checkDuplicates = 'none',
  } = options

  async function validateAndPrepare(
    blob: Blob,
  ): Promise<{ fileName: string; existingKey?: string }> {
    if (blob.size > maxSizeBytes) {
      throw new Error(`File too large. Max ${Math.round(maxSizeBytes / 1024 / 1024)}MB`)
    }
    if (!allowedTypes.includes(blob.type)) {
      throw new Error(`Invalid type. Allowed: ${allowedTypes.join(', ')}`)
    }

    const userId = authStore.currentUser?.id
    if (!userId) throw new Error('Not authenticated')

    const hash =
      checkDuplicates === 'content-hash' ? await generateHash(blob) : Date.now().toString()

    const extension = getFileExtension(blob.type)
    const fileName = `${userId}/${filePrefix}-${hash}.${extension}`

    if (checkDuplicates === 'content-hash') {
      const listResult = await storage.list(bucketName, { prefix: `${userId}/` })
      const existing = listResult.data?.find((f) => f.name.includes(hash.substring(0, 16)))
      if (existing) return { fileName, existingKey: `${userId}/${existing.name}` }
    }

    return { fileName }
  }

  function getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
    }
    return extensions[mimeType] || 'bin'
  }

  function isImageType(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  async function generateHash(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16)
  }

  async function processUpload(blob: Blob, previewUrl?: string): Promise<FileUploadResult> {
    const { fileName, existingKey } = await validateAndPrepare(blob)

    let key: string
    if (existingKey) {
      key = existingKey
    } else {
      const { data } = await storage.upload(bucketName, fileName, blob)
      if (!data) throw new Error('Upload failed')
      key = data.path
    }

    return {
      key,
      id: existingKey ? 'existing' : key,
      // IMPORTANT: use provided previewUrl to avoid creating another blob URL
      previewUrl: isImageType(blob.type) ? previewUrl : undefined,
    }
  }

  async function upload(file: Blob, opts?: { previewUrl?: string }): Promise<FileUploadResult> {
    return await processUpload(file, opts?.previewUrl)
  }

  async function download(key: string, options?: { transform?: ImageTransform }): Promise<Blob> {
    const { data } = await storage.download(bucketName, key, options)
    if (!data) throw new Error('Download failed')
    return data
  }

  async function getUrl(
    key: string,
    transform?: ImageTransform,
    expiresIn = 3600,
  ): Promise<string> {
    const { data } = await storage.createSignedUrl(bucketName, key, expiresIn, { transform })
    if (!data) throw new Error('URL signing failed')
    return data.signedUrl
  }

  async function deleteFile(key: string): Promise<void> {
    await storage.remove(bucketName, [key])
  }

  async function listFiles(prefix?: string): Promise<Array<{ name: string; size?: number }>> {
    const { data } = await storage.list(bucketName, { prefix })
    if (!data) throw new Error('List failed')
    return data.map((f) => ({ name: f.name, size: f.metadata?.size }))
  }

  return {
    upload,
    download,
    delete: deleteFile,
    list: listFiles,
    getUrl,
  }
}
