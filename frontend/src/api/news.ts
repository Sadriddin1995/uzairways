import { request } from './client'

export type News = {
  id: number
  title: string
  slug: string
  content: string
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: string | null
}

export function listPublished() {
  return request<News[]>('/news')
}

export function getBySlug(slug: string) {
  return request<News>(`/news/${encodeURIComponent(slug)}`)
}

