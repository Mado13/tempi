// forms/mobile-utils.ts - Mobile-specific utilities
import { m } from '$lib/i18n/messages'

// Haptic feedback wrapper (gracefully degrades if not available)
export function triggerHaptic(type: 'error' | 'success' | 'warning' = 'error') {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'error':
        navigator.vibrate([50, 30, 50]) // Double tap for errors
        break
      case 'success':
        navigator.vibrate(50) // Single tap for success
        break
      case 'warning':
        navigator.vibrate(30) // Light tap for warnings
        break
    }
  }
}

// Network state detection
export function isOnline(): boolean {
  return navigator.onLine
}

// Translate error messages (handles API error codes)
export function translateError(error: string): string {
  // API errors are typically ALL_CAPS_WITH_UNDERSCORES
  if (/^[A-Z_]+$/.test(error)) {
    const translated = (m as any)[`apiErrors.${error}`]?.()
    return translated || error
  }
  return error
}

// Mobile-friendly error formatting
export function formatFieldError(errors: string[]): string | undefined {
  if (!errors.length) return undefined
  // Only show first error on mobile to reduce clutter
  return translateError(errors[0])
}

// Debounce with mobile-friendly defaults
export function mobileDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 500,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Check if we should retry based on error type
export function shouldRetryRequest(error: any): boolean {
  // Network errors
  if (!isOnline()) return false // Don't retry if offline

  // Timeout or connection errors
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return true
  }

  // 5xx server errors (temporary)
  if (error?.statusCode >= 500 && error?.statusCode < 600) {
    return true
  }

  return false
}

// Simple retry with exponential backoff
export async function retryRequest<T>(fn: () => Promise<T>, maxRetries: number = 2): Promise<T> {
  let lastError: any

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (i === maxRetries || !shouldRetryRequest(error)) {
        throw error
      }

      // Exponential backoff: 1s, 2s, 4s...
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }

  throw lastError
}
