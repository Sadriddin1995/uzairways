import { request } from './client'

export type CabinClass = {
  id: number
  code: string
  name: string
}

export function listClasses() {
  return request<CabinClass[]>('/classes')
}

