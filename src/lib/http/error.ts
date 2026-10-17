import axios from 'axios'

/**
 * Utility to extract user-friendly error messages from API responses.
 * Specifically handles NestJS exception responses and standard Axios errors.
 */
export function getApiErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    if (data && typeof data === 'object') {
      // NestJS standard format: { statusCode: number, message: string | string[], error: string }
      if ('message' in data) {
        const message = (data as { message: unknown }).message
        if (Array.isArray(message)) {
          return message.join(', ')
        }
        if (typeof message === 'string') {
          return message
        }
      }
    }

    if (error.response?.status === 404) {
      return 'The requested resource was not found.'
    }

    if (error.response?.status === 401) {
      return 'Unauthorized. Please verify your credentials.'
    }

    if (error.response?.status === 500) {
      return 'Internal server error. Please try again later.'
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}
