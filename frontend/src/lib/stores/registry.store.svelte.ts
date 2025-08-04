import { Context } from 'runed'

import type { createAuthStore } from './create-auth-store.svelte'

// shared registry
export const storeRegistry = new Map<string, unknown>()

// minimal, typed helper
export function getOrCreate<T>(registry: Map<string, unknown>, key: string, make: () => T): T {
  const existing = registry.get(key) as T | undefined
  if (existing) return existing
  const created = make()
  registry.set(key, created)
  return created
}

// optional helpers (keep if you already use them)
export function destroyStore(key: string) {
  const store = storeRegistry.get(key) as { destroy?: () => void } | undefined
  if (store?.destroy) store.destroy()
  storeRegistry.delete(key)
}

export function initializeAllStores(authStore: ReturnType<typeof createAuthStore>) {
  if (!authStore.isAuthenticated) return
  for (const s of storeRegistry.values()) {
    const store = s as { isInitialized: boolean; init: () => void }
    if (!store.isInitialized) store.init()
  }
}

export function destroyAllStores() {
  for (const s of storeRegistry.values()) {
    const store = s as { destroy?: () => void }
    store.destroy?.()
  }
  storeRegistry.clear()
}

// keep auth context export if other code depends on it
export type AuthStore = ReturnType<typeof createAuthStore>
export const authStoreContext = new Context<AuthStore>('auth-store')
