import { Context } from 'runed'

import type { createAuthStore } from './create-auth-store.svelte'
import { createCrudStore } from './create-crud-store.svelte'

// Store registry for managing multiple CRUD stores
const storeRegistry = new Map<string, any>()

export function getOrCreateStore<TCreate extends Record<string, any>>(
  resource: string,
  contextKey: Context<any>,
): ReturnType<typeof createCrudStore<TCreate>> {
  if (!storeRegistry.has(resource)) {
    const store = createCrudStore<TCreate>(resource)
    storeRegistry.set(resource, store)
    contextKey.set(store)
  }
  return storeRegistry.get(resource)!
}

export function destroyStore(resource: string) {
  const store = storeRegistry.get(resource)
  if (store) {
    store.destroy()
    storeRegistry.delete(resource)
  }
}

export function initializeAllStores(authStore: ReturnType<typeof createAuthStore>) {
  if (!authStore.isAuthenticated) return

  for (const store of storeRegistry.values()) {
    if (!store.isInitialized) {
      store.init()
    }
  }
}

export function destroyAllStores() {
  for (const store of storeRegistry.values()) {
    store.destroy()
  }
  storeRegistry.clear()
}

// Auth store context (always needed)
export type AuthStore = ReturnType<typeof createAuthStore>
export const authStoreContext = new Context<AuthStore>('auth-store')
export { storeRegistry }
