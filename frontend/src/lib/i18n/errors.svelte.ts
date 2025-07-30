// src/lib/errors.ts
export function getErrorMessage(errorCode: string): string {
  const errorMap: Record<string, string> = {
    // Auth errors
    INVALID_PHONE_FORMAT: 'Please enter a valid phone number',
    INVALID_AUTH_CODE: 'The verification code is incorrect',
    MISSING_AUTH_HEADER: 'You need to be logged in',
    SESSION_EXPIRED: 'Session expired. Please login again',
    USER_FESTCH_FAILED: 'Failed to fetch user data',

    // Field validation
    FIELD_REQUIRED: 'This field is required',
    FIELD_TOO_SHORT: 'This value is too short',
    FIELD_TOO_LONG: 'This value is too long',
    FIELD_INVALID_FORMAT: 'Invalid format',
    FIELD_ALREADY_EXISTS: 'This value is already taken',

    // Rate limiting
    RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again later',

    // Generic
    MISSING_PARAMETERS: 'Some required information is missing',
    INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again',
    UNKNOWN_ERROR: 'An unknown error occurred',
    MOBILE_UTIL_ERROR: 'Mobile util error',
    ITEM_NOT_FOUND: 'Item no found',
    NETWORK_ERROR: 'Network error occurred',

    // Pagniation
    CANT_LOAD_MORE: 'Cannot load more',

    // Google maps
    GMAPS_NOT_LOADED: 'Google Maps not loaded',
  }

  return errorMap[errorCode] || `Error: ${errorCode}`
}

export function formatFieldErrors(errors: Record<string, string[]>): string {
  const messages: string[] = []

  for (const [field, codes] of Object.entries(errors)) {
    if (field === '_all') {
      messages.push(...codes.map(getErrorMessage))
    } else {
      const fieldName = field.replace(/_/g, ' ')
      messages.push(`${fieldName}: ${codes.map(getErrorMessage).join(', ')}`)
    }
  }

  return messages.join('. ')
}
