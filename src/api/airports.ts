import { request } from './client'

export type Airport = {
  id: number
  name: string
  iata: string
}

export function listAirports(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : ''
  return request<Airport[]>(`/airports${qs}`)
}

