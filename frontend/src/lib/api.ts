// src/lib/api.ts
import { CapacitorHttp } from '@capacitor/core'
import type { HttpOptions } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import { objectToCamel, objectToSnake } from 'ts-case-convert'

// Get base URL from environment variable
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface ApiRequestOptions extends Omit<HttpOptions, 'url' | 'method' | 'data'> {
  params?: Record<string, any> // Query parameters
}

// Phoenix response structure
export interface PhoenixError {
  errors?: Record<string, string[]>
  retryAfterSeconds?: number
  message?: string
}

// ApiResult structure
export interface ApiResult<T = any> {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
  error?: string
  statusCode: number
}

export async function apiRequest<T = any>(
  path: string,
  method: HttpMethod,
  data?: object,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const { params, ...httpOptions } = options

  // Get auth token if it exists
  const { value: token } = await Preferences.get({ key: 'auth_token' })

  // Build full URL with base URL
  let finalUrl = `${BASE_URL}${path}`

  // Build URL with query params for GET requests or if params provided
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

  // Prepare request options
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

  // Only add data for non-GET requests
  if (method !== 'GET' && data) {
    requestOptions.data = objectToSnake(data)
  }

  try {
    const response = await CapacitorHttp.request(requestOptions)

    // Convert response data to camelCase
    const responseData = objectToCamel(response.data)

    // Handle 401 Unauthorized specifically
    if (response.status === 401) {
      const errorData = (responseData as PhoenixError) || {}

      // If there are field errors, it's a validation issue, not auth issue
      if (errorData.errors && Object.keys(errorData.errors).length > 0) {
        return {
          success: false,
          data: responseData as T,
          errors: errorData.errors,
          error: 'Validation failed',
          statusCode: 401,
        }
      }

      // No field errors = real auth failure, redirect to login
      const { authService } = await import('./utils/auth.svelte')
      await authService.logout()

      const { navigate } = await import('$router')
      navigate('/auth/login')

      return {
        success: false,
        error: 'Session expired. Please login again.',
        statusCode: 401,
      }
    }

    // Handle other error responses (4xx, 5xx)
    if (response.status >= 400) {
      const errorData = (responseData as PhoenixError) || {}
      return {
        success: false,
        data: responseData as T,
        errors: errorData.errors,
        error: errorData.message || 'Request failed',
        statusCode: response.status,
      }
    }

    // Success response
    return {
      success: true,
      data: responseData as T,
      statusCode: response.status,
    }
  } catch (error) {
    // Network errors or other failures
    const httpError = error as any
    return {
      success: false,
      error: 'Network error occurred',
      statusCode: httpError.status || 0,
    }
  }
}

// Convenience methods
export const api = {
  get<T = any>(path: string, options?: ApiRequestOptions) {
    return apiRequest<T>(path, 'GET', undefined, options)
  },

  post<T = any>(path: string, data?: object, options?: ApiRequestOptions) {
    return apiRequest<T>(path, 'POST', data, options)
  },

  put<T = any>(path: string, data?: object, options?: ApiRequestOptions) {
    return apiRequest<T>(path, 'PUT', data, options)
  },

  patch<T = any>(path: string, data?: object, options?: ApiRequestOptions) {
    return apiRequest<T>(path, 'PATCH', data, options)
  },

  delete<T = any>(path: string, options?: ApiRequestOptions) {
    return apiRequest<T>(path, 'DELETE', undefined, options)
  },
}
