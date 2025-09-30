import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import AirportSelect from '../components/AirportSelect'
import { searchFlights } from '../api/flights'
import type { Flight } from '../api/flights'
import { listClasses } from '../api/classes'
import type { CabinClass } from '../api/classes'
import { createReview } from '../api/reviews'
import { createBooking, seatsForFlight } from '../api/bookings'
import type { SeatView } from '../api/bookings'
import { purchaseTicket } from '../api/tickets'
import { useAuth } from '../hooks/useAuth'

export default function Search() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState<string>('')
  const [results, setResults] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<CabinClass[]>([])
  const [selectedClassByFlight, setSelectedClassByFlight] = useState<Record<number, number | ''>>({})
  const { token } = useAuth()
  const [reviewFor, setReviewFor] = useState<number | null>(null)
  const [rating, setRating] = useState<number | ''>('')
  const [comment, setComment] = useState('')
  const [lastTicket, setLastTicket] = useState<any | null>(null)
  const [openSeatsFor, setOpenSeatsFor] = useState<number | null>(null)
  const [seats, setSeats] = useState<SeatView[]>([])
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)

  useEffect(() => { listClasses().then(setClasses).catch(() => {}) }, [])

  // Initial load: show all scheduled flights
  useEffect(() => {
    (async () => {
      try { const res = await searchFlights({}); setResults(res) } catch {}
    })()
  }, [])

  const onSearch = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const res = await searchFlights({ origin, destination, date })
      setResults(res)
    } catch (e: any) { setError(e.message || 'Qidiruvda xatolik') } finally { setLoading(false) }
  }

  const onBook = async (flight: Flight) => {
    if (!token) { setError('Kirish kerak'); return }
    const sc = selectedClassByFlight[flight.id]
    if (!sc) { setError('Iltimos, ushbu parvoz uchun klass tanlang'); return }
    try {
      await createBooking({
        flightId: flight.id,
        classId: Number(sc),
        passengers: [{ firstName: 'Ali', lastName: 'Valiyev', documentNumber: 'AB1234567' }],
      })
      alert('Bron qilindi! "Bronlarim" bo‘limidan ko‘ring.')
    } catch (e: any) { setError(e.message || 'Bron qilishda xatolik') }
  }

  const onBuy = async (flight: Flight) => {
    if (!token) { setError('Kirish kerak'); return }
    const sc = selectedClassByFlight[flight.id]
    if (!sc) { setError('Iltimos, ushbu parvoz uchun klass tanlang'); return }
    if (!selectedSeat) { setError('Iltimos, o‘rindiq tanlang'); return }
    try {
      const t = await purchaseTicket({
        flightId: flight.id,
        classId: Number(sc),
        seatId: Number(selectedSeat),
        passengers: [{ firstName: 'Ali', lastName: 'Valiyev', documentNumber: 'AB1234567' }],
      })
      setLastTicket(t)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e: any) { setError(e.message || 'Bilet sotib olishda xatolik') }
  }

  const toggleSeats = async (flightId: number) => {
    const sc = selectedClassByFlight[flightId]
    if (!sc) { setError('Avval ushbu parvoz uchun klass tanlang'); return }
    const next = openSeatsFor === flightId ? null : flightId
    setOpenSeatsFor(next); setSelectedSeat(null)
    if (next) { try { const list = await seatsForFlight(flightId, Number(sc)); setSeats(list) } catch (e:any) { setError(e.message || 'O‘rindiqlarni olishda xatolik') } }
  }

  const onSendReview = async (flightId: number) => {
    if (!token) { setError('Kirish kerak'); return }
    if (!rating || Number(rating) < 1 || Number(rating) > 5 || !comment.trim()) { setError('Reyting (1..5) va izoh kiriting'); return }
    try { await createReview({ flightId, rating: Number(rating), comment }); setReviewFor(null); setRating(''); setComment(''); alert('Sharh jo‘natildi') } catch (e:any) { setError(e.message || 'Sharh yuborishda xatolik') }
  }

  const priceFor = (f: any, classId?: number): string => {
    const base = Number(f.basePrice || 0) || 0
    if (classId) {
      const byCfg = (f.classPricing as any[]|undefined)?.find(x => Number(x.classId) === Number(classId))
      if (byCfg && byCfg.price && !Number.isNaN(Number(byCfg.price))) return `$${Number(byCfg.price).toFixed(2)}`
      const cm = classes.find(c => c.id === Number(classId)) as any
      const mult = cm && Number.isFinite(Number(cm?.priceMultiplier)) ? Number(cm.priceMultiplier) : 1
      return `$${Number(base * mult).toFixed(2)}`
    }
    const list = (f.classPricing as any[]|undefined)
    const prices = list?.map(x => (x?.price ? Number(x.price) : NaN)).filter(n => !Number.isNaN(n)) as number[] | undefined
    if (prices && prices.length > 0) return `$${Math.min(...prices).toFixed(2)}`
    return base ? `$${base.toFixed(2)}` : '—'
  }

  return (
    <div>
      <div className="card form">
        <h2>Reys qidirish</h2>
        <form onSubmit={onSearch}>
          <div className="row">
            <AirportSelect label="Qayerdan" value={origin} onChange={setOrigin} />
            <AirportSelect label="Qayerga" value={destination} onChange={setDestination} />
            <div className="field">
              <label>Sana</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>
          <button type="submit" disabled={loading}>Qidirish</button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>

      {lastTicket && (
        <div className="card" style={{borderColor:'#2bb67366'}}>
          <div className="title">Bilet sotib olindi</div>
          <div className="kv" style={{marginTop:8}}>
            <div className="kv-item"><div className="kv-k">Ticket ID</div><div className="kv-v">{lastTicket.id ?? '-'}</div></div>
            <div className="kv-item"><div className="kv-k">Booking</div><div className="kv-v">{lastTicket.bookingId ?? '-'}</div></div>
            <div className="kv-item"><div className="kv-k">Holat</div><div className="kv-v">{lastTicket.status ?? 'PAID'}</div></div>
            <div className="kv-item"><div className="kv-k">Summa</div><div className="kv-v">{lastTicket.amount ? `$${Number(lastTicket.amount).toFixed(2)}` : '-'}</div></div>
          </div>
          <div className="muted" style={{marginTop:6}}>Biletlarim bo‘limidan ham ko‘rishingiz mumkin.</div>
        </div>
      )}

      <div className="list">
        {results.map(f => (
          <div className="card" key={f.id}>
            <div className="row between">
              <div>
                <div className="title">{f.flightNumber}</div>
                <div className="muted">{new Date(f.departureTime).toLocaleString()} – {new Date(f.arrivalTime).toLocaleString()}</div>
              </div>
              <div>
                <div className="field" style={{marginBottom:6}}>
                  <label>Klass</label>
                  <select value={selectedClassByFlight[f.id] ?? ''} onChange={e => {
                    const v = e.target.value ? Number(e.target.value) : ''
                    setSelectedClassByFlight(p => ({ ...p, [f.id]: v }))
                    setSelectedSeat(null)
                    if (openSeatsFor === f.id && v) { seatsForFlight(f.id, Number(v)).then(setSeats).catch(()=>{}) }
                  }}>
                    <option value="">Tanlang</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div className="price">{priceFor(f as any, selectedClassByFlight[f.id] ? Number(selectedClassByFlight[f.id]) : undefined)}</div>
                <div className="actions">
                  <button onClick={() => onBook(f)} disabled={!token}>Bron qilish</button>
                  <button onClick={() => toggleSeats(f.id)} disabled={!selectedClassByFlight[f.id]} style={{background:'#1d2a48'}}>O‘rindiqlar</button>
                  <button onClick={() => onBuy(f)} disabled={!token || openSeatsFor!==f.id || !selectedSeat} style={{background:'#2bb673'}}>Bilet sotib olish</button>
                </div>
              </div>
            </div>
            {openSeatsFor===f.id && (
              <div style={{marginTop:10}}>
                <div className="muted" style={{marginBottom:6}}>Tanlangan klass bo‘yicha bo‘sh o‘rindiqlar</div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(64px, 1fr))', gap:8}}>
                  {seats.map(s => (
                    <button key={s.id} onClick={() => !s.occupied && setSelectedSeat(s.id)} disabled={s.occupied}
                      style={{
                        background: selectedSeat===s.id ? '#2c6bed' : (s.occupied ? '#444a' : '#0e182b'),
                        border: '1px solid #2a3553', padding: '10px', borderRadius: 8
                      }}>
                      {s.seatNumber}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="row" style={{marginTop:10, alignItems:'center'}}>
              <button onClick={() => setReviewFor(reviewFor===f.id?null:f.id)} style={{background:'#1d2a48'}}>Sharh qoldirish</button>
              {reviewFor===f.id && (
                <>
                  <div className="field"><label>Reyting</label><input type="number" min={1} max={5} value={rating} onChange={e=>setRating(Number(e.target.value))} /></div>
                  <div className="field" style={{flex:1}}><label>Izoh</label><input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Tajribangiz" /></div>
                  <button onClick={() => onSendReview(f.id)}>Yuborish</button>
                </>
              )}
            </div>
          </div>
        ))}
        {results.length === 0 && !loading && <div className="muted">Natijalar hali yo‘q</div>}
      </div>
    </div>
  )
}

