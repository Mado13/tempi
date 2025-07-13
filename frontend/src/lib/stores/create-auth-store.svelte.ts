// src/lib/stores/create-auth-store.svelte.ts
import { navigate } from '$router'
import { Preferences } from '@capacitor/preferences'

import { api, setAuthToken } from '$lib/api'
import { syncEvents, syncService } from '$lib/services/sync.service'

export type User = {
  id: string
  phoneNumber: string
  currentRole: 'employer' | 'worker'
  employerProfile: string | null
  workerProfile: string | null
}

export function createAuthStore() {
  let isAuthenticated = $state(false)
  let currentUser = $state<User | null>(null)
  let isLoading = $state(true)
  let isInitialized = $state(false)
  let error = $state<Error | null>(null)
  const hasMultipleRoles = $derived(!!(currentUser?.employerProfile && currentUser?.workerProfile))

  async function fetchCurrentUser() {
    if (!isAuthenticated) return
    const response = await api.get<{ user: User }>('/user/me')
    if (response.success && response.data) {
      currentUser = response.data.user
    } else {
      logout()
    }
  }

  async function init() {
    if (isInitialized) return
    syncEvents.on('role:fail', fetchCurrentUser)
    isInitialized = true
    isLoading = true
    error = null
    try {
      const { value: token } = await Preferences.get({ key: 'auth_token' })
      if (token) {
        setAuthToken(token)
        const response = await api.get<{ user: User }>('/user/me')
        if (response.success && response.data) {
          currentUser = response.data.user
          isAuthenticated = true
        } else {
          throw new Error(response.error || 'Invalid session token.')
        }
      }
    } catch (e: any) {
      error = e
      await logout(false)
      throw e
    } finally {
      isLoading = false
    }
  }

  function destroy() {
    syncEvents.off('profile/role:fail', fetchCurrentUser)
    isInitialized = false
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
    currentUser = { ...currentUser, currentRole: newRole }
    await syncService.dispatch({
      type: 'patch',
      resource: '/role',
      payload: { currentRole: newRole },
    })
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
  }
}
