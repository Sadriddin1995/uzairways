import { request } from './client'

type LoginResponse = {
  access_token: string
  user: { id: number; email: string; role: string; fullName: string }
}

export function login(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(fullName: string, email: string, password: string) {
  return request<{ id: number; email: string; role: string; fullName: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  })
}

