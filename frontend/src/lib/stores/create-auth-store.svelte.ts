// src/lib/stores/create-auth-store.svelte.ts
import { navigate } from '$router'
import { Preferences } from '@capacitor/preferences'

import { api, setAuthInterceptor, setAuthToken } from '$lib/api'
import { getErrorMessage } from '$lib/i18n/errors.svelte'

export type User = {
  id: string
  phoneNumber: string
  currentRole: 'employer' | 'worker'
  hasEmployerProfile: boolean
  hasWorkerProfile: boolean
}

export function createAuthStore() {
  let isAuthenticated = $state(false)
  let currentUser = $state<User | null>(null)
  let isLoading = $state(true)
  let isInitialized = $state(false)
  let error = $state<Error | null>(null)
  let abortController: AbortController | null = null

  const hasMultipleRoles = $derived(
    !!(currentUser?.hasEmployerProfile && currentUser?.hasWorkerProfile),
  )

  // Fix Svelte reactivity by using proper state updates
  function updateUser(updates: Partial<User>) {
    if (!currentUser) return
    // Use proper Svelte reactivity instead of object spreading
    Object.assign(currentUser, updates)
  }

  // Centralized auth error handler
  const handleUnauthorized = async () => {
    setAuthToken(null)
    await Preferences.remove({ key: 'auth_token' })
    currentUser = null
    isAuthenticated = false
    error = new Error(getErrorMessage('SESSION_EXPIRED'))
    navigate('/auth/login')
  }

  async function fetchCurrentUser(): Promise<boolean> {
    if (!isAuthenticated) return false

    const response = await api.get<{ user: User }>('/user/me')

    if (response.success && response.data) {
      currentUser = response.data.user
      return true
    } else if (response.statusCode === 401) {
      // Let the interceptor handle this
      return false
    } else {
      error = new Error(response.error || getErrorMessage('USER_FESTCH_FAILED'))
      return false
    }
  }

  async function init() {
    if (isInitialized) return

    // Prevent race conditions by canceling previous init
    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    isInitialized = true
    isLoading = true
    error = null

    // Set up centralized auth interceptor
    setAuthInterceptor({ onUnauthorized: handleUnauthorized })

    try {
      const { value: token } = await Preferences.get({ key: 'auth_token' })
      if (token) {
        setAuthToken(token)

        // Check if we were aborted during async operation
        if (abortController?.signal.aborted) return

        const response = await api.get<{ user: User }>('/user/me')

        if (response.success && response.data) {
          currentUser = response.data.user
          isAuthenticated = true
        }
        // Don't handle 401s here - let the interceptor do it
      }
    } catch (e: any) {
      // Handle errors completely here - don't bubble up
      if (e.name !== 'AbortError') {
        console.error('Auth initialization failed:', e)
        error = e
        await handleUnauthorized()
      }
    } finally {
      isLoading = false
    }
  }

  function destroy() {
    // Clean up properly to prevent race conditions
    if (abortController) {
      abortController.abort()
      abortController = null
    }

    // Remove auth interceptor
    setAuthInterceptor(null)

    isInitialized = false
    isLoading = false
    error = null
  }

  async function login(token: string, user: User) {
    setAuthToken(token)
    await Preferences.set({ key: 'auth_token', value: token })
    currentUser = user
    isAuthenticated = true
    error = null
  }

  async function logout(shouldNavigate = true) {
    setAuthToken(null)
    await Preferences.remove({ key: 'auth_token' })
    currentUser = null
    isAuthenticated = false
    if (shouldNavigate) navigate('/auth/login')
  }

  async function switchRole(newRole: 'employer' | 'worker') {
    if (!currentUser || currentUser.currentRole === newRole) return

    const originalRole = currentUser.currentRole

    // 1. Optimistic Update using proper reactivity
    updateUser({ currentRole: newRole })

    // 2. API Call
    const result = await api.patch('/role', { currentRole: newRole })

    // 3. Handle Response
    if (!result.success && result.statusCode !== 401) {
      // Revert only if not an auth error
      updateUser({ currentRole: originalRole })
    } else if (result.success) {
      // On success, navigate
      navigate('/app/:role/jobs', { params: { role: newRole } })
    }
    // Auth errors are handled by the interceptor
  }

  return {
    get isAuthenticated() {
      return isAuthenticated
    },
    get currentUser() {
      return currentUser
    },
    get isLoading() {
      return isLoading
    },
    get isInitialized() {
      return isInitialized
    },
    get hasMultipleRoles() {
      return hasMultipleRoles
    },
    get error() {
      return error
    },
    init,
    destroy,
    login,
    logout,
    switchRole,
    fetchCurrentUser,
  }
}
