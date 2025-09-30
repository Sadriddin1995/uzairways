import { useEffect, useState } from 'react'
import { myBookings } from '../api/bookings'

export default function MyBookings() {
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    myBookings().then((v) => setItems(v)).catch(e => setError(e.message || 'Xatolik'))
  }, [])

  return (
    <div>
      <h2>Bronlarim</h2>
      {error && <div className="error">{error}</div>}
      <div className="list">
        {items.map((b: any) => (
          <div className="card" key={b.id}>
            <div className="title">Booking #{b.id}</div>
            <div className="muted">Holat: {b.status}</div>
          </div>
        ))}
        {items.length === 0 && !error && <div className="muted">Hali bron qilmagansiz.</div>}
      </div>
    </div>
  )
}
