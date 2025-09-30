import { request } from './client'

export type Review = {
  id: number
  userId: number
  flightId: number
  rating: number
  comment: string
}

export function createReview(data: { flightId: number; rating: number; comment: string }) {
  return request('/reviews', { method: 'POST', body: JSON.stringify(data) })
}

export function listByFlight(flightId: number) {
  return request<Review[]>(`/reviews/flight/${flightId}`)
}

export function adminList() {
  return request<Review[]>(`/reviews`)
}

export function remove(id: number) {
  return request(`/reviews/${id}`, { method: 'DELETE' })
}

