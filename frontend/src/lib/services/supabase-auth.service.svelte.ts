import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import { Context } from 'runed'

import { api } from '$lib/api'

interface SupabaseTokenResponse {
  token: string
  expires_at: number // epoch seconds
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY

export function createSupabaseAuthService() {
  let currentToken: string | null = null
  let tokenExpiry: number | null = null
  let refreshPromise: Promise<string | null> | null = null

  // forward-declare so our custom fetch can call it
  async function ensureValidTokenInternal(): Promise<string | null> {
    const now = Math.floor(Date.now() / 1000)

    // compute TTL if we have one
    const ttl = tokenExpiry ? tokenExpiry - now : 0
    // refresh when within 10% of TTL or <= 30s, cap at 180s
    const skew = Math.min(180, Math.max(30, Math.floor(ttl * 0.1)))

    if (currentToken && tokenExpiry && tokenExpiry - skew > now) {
      return currentToken
    }

    if (refreshPromise) return await refreshPromise

    refreshPromise = (async () => {
      try {
        const res = await api.post<SupabaseTokenResponse>('/supabase-token', {})
        if (!res.success || !res.data) throw new Error(res.error ?? 'token fetch failed')
        currentToken = res.data.token
        tokenExpiry = res.data.expires_at
        return currentToken
      } catch {
        currentToken = null
        tokenExpiry = null
        return null
      } finally {
        refreshPromise = null
      }
    })()

    return await refreshPromise
  }

  // single client, custom fetch injects authorization on every call
  const client: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    realtime: { params: { eventsPerSecond: 0 } },
    global: {
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const token = await ensureValidTokenInternal()
        const headers = new Headers(init?.headers ?? {})
        if (token) headers.set('Authorization', `Bearer ${token}`)
        return fetch(input, { ...init, headers })
      },
    },
  })

  async function initialize(): Promise<boolean> {
    const token = await ensureValidTokenInternal()
    return !!token
  }

  function clearToken() {
    currentToken = null
    tokenExpiry = null
  }

  function getClient() {
    return client
  }

  return {
    get isAuthenticated() {
      return !!currentToken
    },
    get isInitializing() {
      return !!refreshPromise
    },
    initialize,
    ensureValidToken: ensureValidTokenInternal,
    clearToken,
    getClient,
  }
}

export const supabaseAuthContext = new Context<ReturnType<typeof createSupabaseAuthService>>(
  'supabase-auth',
)
export const supabaseAuthService = createSupabaseAuthService()
