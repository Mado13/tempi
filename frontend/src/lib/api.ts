// src/lib/api.ts
import { CapacitorHttp, type HttpOptions } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { objectToCamel, objectToSnake } from 'ts-case-convert'

import { m } from '$lib/i18n/messages'
import * as snackbar from '$lib/snackbar/snackbar.service.svelte'
import type { AuthStore } from '$lib/stores/contexts'

let _authStore: AuthStore | null = null

/**
 * Initializes the API module with a reference to the auth store.
 * This allows the API to perform actions like logging out the user on a 401 response.
 * This function should be called once from the StoreProvider.
 * @param authStoreInstance - The created auth store instance.
 */
export function initApi(authStoreInstance: AuthStore) {
  _authStore = authStoreInstance
}

let inMemoryToken: string | null = null

// ... setAuthToken and getToken functions remain the same ...
export function setAuthToken(token: string | null) {
  inMemoryToken = token
  if (token) {
    Preferences.set({ key: 'auth_token', value: token })
  } else {
    Preferences.remove({ key: 'auth_token' })
  }
}

async function getToken(): Promise<string | null> {
  if (inMemoryToken) {
    return inMemoryToken
  }

  const { value } = await Preferences.get({ key: 'auth_token' })
  if (value) {
    inMemoryToken = value
    return value
  }

  return null
}

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000'

// ... Type definitions (ApiRequestOptions, ApiResult, etc.) remain the same ...
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiRequestOptions extends Omit<HttpOptions, 'url' | 'method' | 'data'> {
  params?: Record<string, any>
  resource?: string
  snackbar?: string | false
}

export interface PhoenixError {
  errors?: Record<string, string[]>
  retryAfterSeconds?: number
  message?: string
}

export interface ApiResult<T = any> {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
  error?: string
  statusCode: number
  isNetworkError?: boolean
}

export async function apiRequest<T = any>(
  path: string,
  method: HttpMethod,
  data?: object,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  // ... URL and parameter handling logic remains the same ...
  const { params, resource, snackbar: snackbarOption, ...httpOptions } = options
  const token = await getToken()
  let finalUrl = `${BASE_URL}${path}`
  if (params && Object.keys(params).length > 0) {
    const snakeParams = objectToSnake(params)
    const searchParams = new URLSearchParams()
    Object.entries(snakeParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    finalUrl = `${finalUrl}?${searchParams.toString()}`
  }

  const requestOptions: HttpOptions = {
    url: finalUrl,
    method,
    ...httpOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(httpOptions.headers ?? {}),
    },
  }

  if (method !== 'GET' && data) {
    requestOptions.data = objectToSnake(data)
  }

  try {
    const response = await CapacitorHttp.request(requestOptions)
    const responseData = objectToCamel(response.data)

    // ... handleSnackbar logic remains the same ...
    const handleSnackbar = (isSuccess: boolean, errorMsg?: string) => {
      if (snackbarOption === false || method === 'GET') return
      if (typeof snackbarOption === 'string') {
        snackbar.show(snackbarOption, { type: isSuccess ? 'success' : 'error' })
        return
      }
      const actionMap = { POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' }
      const action = actionMap[method as keyof typeof actionMap]
      const result = isSuccess ? 'Success' : 'Error'
      const resourceKey = resource ? `${resource}_${action}${result}` : `item_${action}${result}`
      const genericKey = `item_${action}${result}`
      if (resourceKey in m) {
        snackbar.show((m as any)[resourceKey](), { type: isSuccess ? 'success' : 'error' })
      } else if (genericKey in m) {
        snackbar.show((m as any)[genericKey](), { type: isSuccess ? 'success' : 'error' })
      } else if (!isSuccess) {
        snackbar.show(errorMsg || 'An unknown error occurred', { type: 'error' })
      }
    }

    if (response.status === 401) {
      // ✅ FIX: Use the injected store instance to log the user out.
      if (_authStore) {
        await _authStore.logout()
      }
      return { success: false, error: 'Session expired. Please login again.', statusCode: 401 }
    }

    // ... other status code handling (4xx, success) remains the same ...
    if (response.status >= 400) {
      const errorData = (responseData as PhoenixError) || {}
      handleSnackbar(false, errorData.message)
      return {
        success: false,
        data: responseData as T,
        errors: errorData.errors,
        error: errorData.message || 'Request failed',
        statusCode: response.status,
      }
    }

    handleSnackbar(true)
    return {
      success: true,
      data: responseData as T,
      statusCode: response.status,
    }
  } catch (error) {
    // ... network error handling remains the same ...
    if (snackbarOption !== false) {
      snackbar.show(m.item_networkError ? m.item_networkError() : 'Network error occurred', {
        type: 'error',
      })
    }
    const httpError = error as any
    return {
      success: false,
      error: 'Network error occurred',
      statusCode: httpError.status || 0,
      isNetworkError: true,
    }
  }
}

export const api = {
  get: <T = any>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, 'GET', undefined, options),
  post: <T = any>(path: string, data?: object, options?: ApiRequestOptions) =>
    apiRequest<T>(path, 'POST', data, options),
  put: <T = any>(path: string, data?: object, options?: ApiRequestOptions) =>
    apiRequest<T>(path, 'PUT', data, options),
  patch: <T = any>(path: string, data?: object, options?: ApiRequestOptions) =>
    apiRequest<T>(path, 'PATCH', data, options),
  delete: <T = any>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, 'DELETE', undefined, options),
}
