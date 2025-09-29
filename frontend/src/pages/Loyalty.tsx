import { useEffect, useState } from 'react'
import { myLoyalty, type LoyaltyTx } from '../api/loyalty'

export default function Loyalty() {
  const [items, setItems] = useState<LoyaltyTx[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    myLoyalty().then((d) => setItems(d.history)).catch((e) => setError(e.message))
  }, [])

  return (
    <div>
      <h2>Loyallik tarixi</h2>
      {error && <div className="form error">{error}</div>}
      <div className="list">
        {items.map((tx) => (
          <div className="card" key={tx.id}>
            <div className="row between">
              <div>
                <div className="title">{tx.type === 'EARN' ? 'Ball qo‘shildi' : 'Ball yechildi'}</div>
                <div className="muted">Booking: {tx.bookingId ?? '-'}</div>
              </div>
              <div className="price">{tx.type === 'EARN' ? '+' : '-'}{tx.points} ball</div>
            </div>
          </div>
        ))}
        {items.length === 0 && !error && <div className="muted">Tarix topilmadi</div>}
      </div>
    </div>
  )
}

