const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

let tokenGetter: () => string | null = () => localStorage.getItem('token')

export function setTokenGetter(fn: () => string | null) {
  tokenGetter = fn
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  // Only set JSON headers if there is a body
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  if (!headers['Accept']) headers['Accept'] = 'application/json'

  const token = tokenGetter()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const url = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
  try {
    const res = await fetch(url, { ...options, method, headers })
    const text = await res.text()
    let data: any
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    if (!res.ok) {
      const raw = (data && (data.message || data.error)) || ''
      const combined = Array.isArray(raw) ? raw.join(', ') : String(raw || res.statusText)
      const userMsg = res.status >= 500
        ? 'Server xatosi. Iltimos, keyinroq urinib ko‘ring.'
        : combined
      throw new Error(userMsg)
    }
    return data as T
  } catch (e: any) {
    // Log texnik tafsilotlarni konsolga, foydalanuvchiga yumshoq xabar bering
    console.error('API request failed', { url, error: e })
    throw new Error('Tarmoq xatosi. Internet yoki serverni tekshiring.')
  }
}
