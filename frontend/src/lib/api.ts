// src/lib/api.ts
import { CapacitorHttp, type HttpOptions } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { objectToCamel, objectToSnake } from 'ts-case-convert'

import { addSnack } from './components/Snackbar.svelte'
import { formatFieldErrors, getErrorMessage } from './i18n/errors.svelte'

let inMemoryToken: string | null = null

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

// Centralized auth interceptor
export interface AuthInterceptor {
  onUnauthorized: () => Promise<void>
}

let authInterceptor: AuthInterceptor | null = null

export function setAuthInterceptor(interceptor: AuthInterceptor | null) {
  authInterceptor = interceptor
}

export async function apiRequest<T = any>(
  path: string,
  method: HttpMethod,
  data?: object,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
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

  const handleSnackbar = (isSuccess: boolean, errorData?: PhoenixError) => {
    if (snackbarOption === false || method === 'GET') return

    if (typeof snackbarOption === 'string') {
      addSnack({
        data: {
          title: isSuccess ? 'Success' : 'Error',
          description: snackbarOption,
          type: isSuccess ? 'success' : 'error',
        },
      })
      return
    }

    if (!isSuccess && errorData?.errors) {
      const errorMessage = formatFieldErrors(errorData.errors)
      addSnack({
        data: {
          title: 'Error',
          description: errorMessage,
          type: 'error',
        },
      })
      return
    }

    if (isSuccess) {
      if (!snackbarOption && import.meta.env.DEV) {
        console.warn(`No snackbar message provided for ${method} ${path}`)
      }
    }
  }

  try {
    const response = await CapacitorHttp.request(requestOptions)
    const responseData = objectToCamel(response.data)

    if (response.status === 401) {
      // Use centralized auth interceptor
      if (authInterceptor) {
        await authInterceptor.onUnauthorized()
      }
      return { success: false, error: getErrorMessage('SESSION_EXPIRED'), statusCode: 401 }
    }

    if (response.status >= 400) {
      const errorData = (responseData as PhoenixError) || {}
      handleSnackbar(false, errorData)
      return {
        success: false,
        data: responseData as T,
        errors: errorData.errors,
        error: errorData.message || formatFieldErrors(errorData.errors || {}),
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
    if (snackbarOption !== false) {
      addSnack({
        data: {
          title: 'Network Error',
          description: getErrorMessage('NETWORK_ERROR'),
          type: 'error',
        },
      })
    }
    const httpError = error as any
    return {
      success: false,
      error: getErrorMessage('NETWORK_ERROR'),
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
