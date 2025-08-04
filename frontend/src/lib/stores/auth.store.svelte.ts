import { createAuthStore } from './create-auth-store.svelte'
import type { User } from './create-auth-store.svelte'

const _auth = createAuthStore()

// expose a sync accessor used by sessionKey()
function user(): User | null {
  return _auth.currentUser
}

export const authStore = Object.assign(_auth, { user })
