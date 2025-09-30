import { request } from './client'

export type Flight = {
  id: number
  flightNumber: string
  departureTime: string
  arrivalTime: string
  basePrice?: string
  originAirportId: number
  destinationAirportId: number
  companyId: number
  planeId: number
  computedPrice?: string
  classPricing?: { classId: number; price?: string; seatLimit?: number }[]
}

export type SearchParams = {
  origin?: string
  destination?: string
  date?: string
  cabin?: string
  adults?: number
}

export function searchFlights(params: SearchParams) {
  const clean: Record<string, any> = {}
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') clean[k] = String(v)
  })
  const qs = new URLSearchParams(clean as any).toString()
  return request<Flight[]>(`/flights/search?${qs}`)
}

export function getFlight(id: number) {
  return request<Flight>(`/flights/${id}`)
}
