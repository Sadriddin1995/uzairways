import { useEffect, useState } from 'react'
import type { Airport } from '../api/airports'
import { listAirports } from '../api/airports'

export default function AirportSelect({ label, value, onChange }: {
  label: string
  value: string
  onChange: (iata: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [options, setOptions] = useState<Airport[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    const h = setTimeout(async () => {
      if (query.length < 1) { setOptions([]); return }
      const res = await listAirports(query.toUpperCase())
      setOptions(res)
    }, 250)
    return () => clearTimeout(h)
  }, [query])

  return (
    <div className="field">
      <label>{label}</label>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => setOpen(true)}
        placeholder="Masalan: TAS"
      />
      {open && options.length > 0 && (
        <div className="dropdown">
          {options.map(a => (
            <div key={a.id} className="option" onMouseDown={() => { onChange(a.iata); setQuery(a.iata); setOpen(false) }}>
              <strong>{a.iata}</strong> — {a.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
