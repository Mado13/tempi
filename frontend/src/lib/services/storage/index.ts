// src/lib/services/storage/index.ts
import { makeSupabaseStorageAdapter } from '$lib/adapters/supabase-storage.adapter.svelte'
import { supabaseAuthService } from '$lib/services/supabase-auth.service.svelte'
import type { createAuthStore } from '$lib/stores/create-auth-store.svelte'

import { createFileStorageService } from '../file-storage.service.svelte'
import { createPhotoService } from '../photo.service.svelte'

type AuthStore = ReturnType<typeof createAuthStore>

let services: null | StorageServices = null

export function initStorageServices(authStore: AuthStore) {
  if (services) return services

  const supabaseStorageAdapter = makeSupabaseStorageAdapter(() => supabaseAuthService.getClient())

  const logoFileService = createFileStorageService(
    'dev-tempi-logos',
    supabaseStorageAdapter,
    authStore,
    {
      maxSizeBytes: 2 * 1024 * 1024,
      allowedTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
      filePrefix: 'logo',
      quality: 95,
      checkDuplicates: 'content-hash',
    },
  )

  const profilePhotoFileService = createFileStorageService(
    'dev-tempi-photos',
    supabaseStorageAdapter,
    authStore,
    {
      maxSizeBytes: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      filePrefix: 'profile',
      quality: 90,
      checkDuplicates: 'content-hash',
    },
  )

  const documentsFileService = createFileStorageService(
    'dev-tempi-documents',
    supabaseStorageAdapter,
    authStore,
    {
      maxSizeBytes: 10 * 1024 * 1024,
      allowedTypes: ['application/pdf', 'text/plain', 'application/msword'],
      filePrefix: 'doc',
      checkDuplicates: 'none',
    },
  )

  const logoPhotoService = createPhotoService(logoFileService)
  const profilePhotoService = createPhotoService(profilePhotoFileService)

  services = {
    photos: { logos: logoPhotoService, profiles: profilePhotoService },
    files: {
      logos: logoFileService,
      photos: profilePhotoFileService,
      documents: documentsFileService,
    },
  } as const

  return services
}

export function getStorageServices() {
  if (!services)
    throw new Error(
      'Storage services not initialized. Call initStorageServices() in a component first.',
    )
  return services
}

export type StorageServices = {
  photos: {
    logos: ReturnType<typeof createPhotoService>
    profiles: ReturnType<typeof createPhotoService>
  }
  files: {
    logos: ReturnType<typeof createFileStorageService>
    photos: ReturnType<typeof createFileStorageService>
    documents: ReturnType<typeof createFileStorageService>
  }
}

export type {
  FileUploadResult,
  ImageTransform,
  StorageProvider,
  FileUploadOptions,
} from '../file-storage.service.svelte'
export type { PhotoResult, PhotoUploadResult, PhotoUploadOptions } from '../photo.service.svelte'
