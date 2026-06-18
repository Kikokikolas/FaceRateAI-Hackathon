import axios from 'axios'
import { messageForErrorCode, type AppError } from '../lib/errorMessages'
import { API_BASE_URL } from './config'

let authTokenProvider: (() => Promise<string | null>) | null = null

export function setAuthTokenProvider(provider: (() => Promise<string | null>) | null) {
  authTokenProvider = provider
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
})

function redirectToPricingForTokens() {
  if (window.location.pathname !== '/pricing') {
    window.location.assign('/pricing?reason=tokens')
  }
}

// Attach the current Clerk session token to every request if present.
api.interceptors.request.use(async (config) => {
  const token = authTokenProvider ? await authTokenProvider() : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Surface API error messages cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error?.response?.data?.detail
    const apiCode = detail && typeof detail === 'object' && !Array.isArray(detail) ? detail.code : undefined
    const apiMessage = detail && typeof detail === 'object' && !Array.isArray(detail) ? detail.message : undefined
    const formattedDetail = Array.isArray(detail)
      ? detail.map((item) => item?.msg || JSON.stringify(item)).join(', ')
      : typeof detail === 'string'
        ? detail
        : apiMessage
    const message =
      messageForErrorCode(apiCode) ||
      formattedDetail ||
      error?.message ||
      'Ocorreu um erro inesperado.'
    const appError = new Error(message) as AppError
    appError.code = apiCode
    appError.status = error?.response?.status
    appError.userMessage = message
    appError.rawDetail = detail
    if (apiCode === 'INSUFFICIENT_TOKENS') {
      redirectToPricingForTokens()
    }
    return Promise.reject(appError)
  },
)

export default api
