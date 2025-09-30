import { useEffect, useState } from 'react'
import { myTickets, type Ticket } from '../api/tickets'

export default function MyTickets() {
  const [items, setItems] = useState<Ticket[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { myTickets().then(setItems).catch(e=>setError(e.message)) }, [])
  return (
    <div>
      <h2>Biletlarim</h2>
      {error && <div className="form error">{error}</div>}
      <div className="list">
        {items.map(t => (
          <div className="card" key={t.id}>
            <div className="row between">
              <div>
                <div className="title">Ticket #{t.id}</div>
                <div className="muted">Booking ID: {t.bookingId}</div>
              </div>
              <div className="actions">
                <span className="muted">Holat: {t.status}</span>
                <span className="price">${Number(t.amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && !error && <div className="muted">Hali bilet yo‘q</div>}
      </div>
    </div>
  )
}


