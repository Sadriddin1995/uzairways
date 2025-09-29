import { request } from './client'

export type Ticket = {
  id: number
  bookingId: number
  amount: string
  status: 'PAID' | 'REFUNDED' | 'CANCELLED'
  booking?: {
    id: number
    pnr: string
    classId: number
    totalPrice: string
    flight?: { id: number; flightNumber: string; departureTime: string; arrivalTime: string }
  }
}

export function myTickets() {
  return request<Ticket[]>(`/tickets/mine`)
}

export function purchaseTicket(data: {
  flightId: number
  returnFlightId?: number
  classId: number
  seatId: number
  passengers: { firstName: string; lastName: string; documentNumber: string }[]
}) {
  return request<any>(`/tickets`, { method: 'POST', body: JSON.stringify(data) })
}