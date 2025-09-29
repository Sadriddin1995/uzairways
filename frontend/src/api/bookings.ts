import { request } from './client'

export type Passenger = {
  firstName: string
  lastName: string
  documentNumber: string
}

export function createBooking(data: {
  flightId: number
  returnFlightId?: number
  classId: number
  passengers: Passenger[]
}) {
  return request(`/bookings`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function myBookings() {
  return request<any[]>(`/bookings/mine`)
}

export type SeatView = { id: number; seatNumber: string; row: number; col: string; classId: number; occupied: boolean }

export function seatsForFlight(flightId: number, classId?: number) {
  const qs = classId ? `?classId=${classId}` : ''
  return request<SeatView[]>(`/bookings/${flightId}/seats${qs}`)
}
