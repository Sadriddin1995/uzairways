import { useEffect, useState } from 'react'
import { listPublished } from '../api/news'
import type { News } from '../api/news'

export default function NewsList() {
  const [items, setItems] = useState<News[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    listPublished()
      .then(setItems)
      .catch((e) => setError(e.message || 'Xatolik'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="section-title">Yangiliklar</div>
      {error && <div className="form error">{error}</div>}
      {loading && <div className="muted">Yuklanmoqda...</div>}
      <div className="news-grid">
        {items.map((n) => (
          <div className="card" key={n.id}>
            <div className="title">{n.title}</div>
            <div className="muted" style={{marginTop:4}}>
              {n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ''}
            </div>
            <div style={{marginTop:8}}>{truncate(n.content, 220)}</div>
          </div>
        ))}
      </div>
      {!loading && items.length === 0 && <div className="muted" style={{marginTop:8}}>Hozircha yangiliklar yo‘q</div>}
    </div>
  )
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + '…'
}
