const trimTrailingSlash = (value: string) => value.replace(/\/$/, '')

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '/api'),
)

export function backendAssetUrl(path: string | null | undefined) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
