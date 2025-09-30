import { request } from './client'

export type LoyaltyTx = {
  id: number
  bookingId: number | null
  points: number
  type: 'EARN' | 'REDEEM'
}

export function myLoyalty() {
  return request<{ userId: number; history: LoyaltyTx[] }>(`/loyalty/me`)
}

