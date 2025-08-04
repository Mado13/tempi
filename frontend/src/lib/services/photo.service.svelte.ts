import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

import type { ImageTransform } from './file-storage.service.svelte'
import type { createFileStorageService } from './file-storage.service.svelte'

export interface PhotoResult {
  file: Blob
  previewUrl: string
}

export interface PhotoUploadResult {
  key: string
  id: string
}

export interface PhotoUploadOptions {
  filePrefix?: string
  quality?: number
  previewUrl?: string
}

type FileStorageService = ReturnType<typeof createFileStorageService>

export function createPhotoService(fileStorageService: FileStorageService) {
  async function selectPhoto(quality: number = 90): Promise<PhotoResult | null> {
    const image = await Camera.getPhoto({
      quality,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    })
    if (!image?.webPath) return null

    const response = await fetch(image.webPath)
    const file = await response.blob()

    return { file, previewUrl: image.webPath }
  }

  async function uploadPhoto(
    file: Blob,
    options: PhotoUploadOptions = {},
  ): Promise<PhotoUploadResult> {
    const result = await fileStorageService.upload(file, { previewUrl: options.previewUrl })
    return { key: result.key, id: result.id }
  }

  async function uploadLogo(
    file: Blob,
    options: PhotoUploadOptions & { transform?: ImageTransform } = {},
  ): Promise<PhotoUploadResult> {
    const result = await fileStorageService.upload(file, { previewUrl: options.previewUrl })
    return { key: result.key, id: result.id }
  }

  async function downloadPhoto(key: string, transform?: ImageTransform): Promise<Blob> {
    return await fileStorageService.download(key, { transform })
  }

  async function downloadLogo(key: string, transform?: ImageTransform): Promise<Blob> {
    // If transforms aren’t enabled on your plan, pass undefined here
    const defaultTransform: ImageTransform = { width: 96, height: 96, quality: 90 }
    return await fileStorageService.download(key, {
      transform: transform ? { ...defaultTransform, ...transform } : undefined,
    })
  }

  async function urlForThumb(_key: string): Promise<string> {
    throw new Error('urlForThumb is not used in blob-only flow')
  }

  return {
    selectPhoto,
    uploadPhoto,
    uploadLogo,
    downloadPhoto,
    downloadLogo,
    urlForThumb,
  }
}
