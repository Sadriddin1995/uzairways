import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { request } from '../api/client'
import { listAirports } from '../api/airports'

type Field = { name: string; label: string; type?: 'text' | 'number' | 'datetime'; width?: number }
type Resource = {
  key: string
  label: string
  base: string
  listPath?: string
  idField?: string
  fields: Field[]
  columns?: string[]
  createDisabled?: boolean
  updateDisabled?: boolean
}

function useOptions(endpoint: string) {
  const [opts, setOpts] = useState<any[]>([])
  useEffect(() => {
    (async () => { try { const data = await request(endpoint); setOpts(data as any[]); } catch { /* ignore */ } })()
  }, [endpoint])
  return opts
}

function CompanySelect({ value, onChange }: any) {
  const items = useOptions('/companies')
  return (
    <select value={value ?? ''} onChange={e=>onChange(Number(e.target.value))}>
      <option value="">Tanlang</option>
      {items.map((c:any)=> <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
    </select>
  )
}

function PlaneSelect({ value, onChange }: any) {
  const items = useOptions('/planes')
  return (
    <select value={value ?? ''} onChange={e=>onChange(Number(e.target.value))}>
      <option value="">Tanlang</option>
      {items.map((p:any)=> <option key={p.id} value={p.id}>{p.model} ({p.code})</option>)}
    </select>
  )
}

function AdminAirportSelect({ onChange }: any) {
  const [q, setQ] = useState('')
  const [opts, setOpts] = useState<any[]>([])
  useEffect(() => {
    const h = setTimeout(async ()=>{
      const list = await listAirports(q || '')
      setOpts(list)
    }, 200)
    return ()=> clearTimeout(h)
  }, [q])
  return (
    <div style={{position:'relative'}}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Aeroport nomi yoki IATA" />
      {opts.length>0 && (
        <div className="dropdown">
          {opts.map((a:any)=> (
            <div key={a.id} className="option" onMouseDown={()=>{ onChange(a.id); setQ(`${a.iata} — ${a.name}`) }}>
              <strong>{a.iata}</strong> — {a.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function niceErr(e: any) {
  const m = (e && e.message) ? String(e.message) : 'Xatolik yuz berdi'
  if (/network/i.test(m) || /Failed to fetch/i.test(m) || /cors|proxy/i.test(m)) return 'Tarmoq xatosi. Iltimos qayta urinib ko‘ring.'
  if (/internal server error/i.test(m)) return 'Server xatosi. Iltimos keyinroq urinib ko‘ring.'
  return m
}

const RESOURCES: Resource[] = [
  { key: 'countries', label: 'Davlatlar', base: '/countries', fields: [
      { name: 'name', label: 'Name' },
      { name: 'isoCode', label: 'ISO (2)' },
    ], columns: ['id','name','isoCode'] },
  { key: 'cities', label: 'Shaharlar', base: '/cities', fields: [
      { name: 'name', label: 'Name' },
      { name: 'countryId', label: 'Country ID', type: 'number' },
    ], columns: ['id','name','countryId'] },
  { key: 'airports', label: 'Aeroportlar', base: '/airports', fields: [
      { name: 'name', label: 'Name' },
      { name: 'iata', label: 'IATA' },
      { name: 'cityId', label: 'City ID', type: 'number' },
    ], columns: ['id','name','iata','cityId'] },
  { key: 'companies', label: 'Kompaniyalar', base: '/companies', fields: [
      { name: 'name', label: 'Name' },
      { name: 'code', label: 'Code' },
    ], columns: ['id','name','code'] },
  { key: 'planes', label: 'Samolyotlar', base: '/planes', fields: [
      { name: 'model', label: 'Model' },
      { name: 'code', label: 'Code' },
      { name: 'companyId', label: 'Company ID', type: 'number' },
    ], columns: ['id','model','code','companyId'] },
  { key: 'classes', label: 'Klasslar', base: '/classes', fields: [
      { name: 'name', label: 'Name' },
      { name: 'code', label: 'Code' },
    ], columns: ['id','name','code'] },
  { key: 'flights', label: 'Parvozlar', base: '/flights', fields: [
      { name: 'companyId', label: 'Company ID', type: 'number' },
      { name: 'planeId', label: 'Plane ID', type: 'number' },
      { name: 'originAirportId', label: 'From Airport', type: 'number' },
      { name: 'destinationAirportId', label: 'To Airport', type: 'number' },
      { name: 'flightNumber', label: 'Flight No.' },
      { name: 'departureTime', label: 'Departure ISO', type: 'text' },
      { name: 'arrivalTime', label: 'Arrival ISO', type: 'text' },
    ], columns: ['id','flightNumber','departureTime','arrivalTime','status'] },
  { key: 'news', label: 'Yangiliklar', base: '/news', listPath: '/news/admin/all', fields: [
      { name: 'title', label: 'Title' },
      { name: 'slug', label: 'Slug' },
      { name: 'content', label: 'Content' },
      { name: 'status', label: 'Status (DRAFT|PUBLISHED)' },
      { name: 'publishedAt', label: 'Published ISO', type: 'text' },
    ], columns: ['id','title','slug','status'] },
  { key: 'seats', label: "O'rindiqlar", base: '/seats', fields: [
      { name: 'planeId', label: 'Plane ID', type: 'number' },
      { name: 'seatNumber', label: 'Seat Number' },
      { name: 'row', label: 'Row', type: 'number' },
      { name: 'col', label: 'Column' },
      { name: 'classId', label: 'Class ID', type: 'number' },
    ], columns: ['id','planeId','seatNumber','classId'] },
  { key: 'reviews', label: 'Sharhlar', base: '/reviews', fields: [], columns: ['id','userId','flightId','rating','comment'], createDisabled: true, updateDisabled: true },
]

function CrudTable({ resource }: { resource: Resource }) {
  const idField = resource.idField || 'id'
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createData, setCreateData] = useState<Record<string, any>>({})
  const [editing, setEditing] = useState<Record<string | number, any>>({})

  const listUrl = resource.listPath || resource.base

  const reload = async () => {
    setLoading(true); setError(null)
    try { setItems(await request<any[]>(listUrl)) } catch (e: any) { setError(niceErr(e)) } finally { setLoading(false) }
  }

  useEffect(() => { reload() }, [listUrl])

  const onCreate = async () => {
    try {
      if (resource.key === 'flights') {
        const d: any = createData || {}
        if (!d.companyId || !d.planeId || !d.originAirportId || !d.destinationAirportId) {
          setError('Company, Plane va aeroportlarni tanlang.'); return
        }
        if (d.originAirportId === d.destinationAirportId) {
          setError('Qayerdan va Qayerga bir xil bo‘lishi mumkin emas.'); return
        }
        if (!d.departureTime || !d.arrivalTime) { setError('Departure va Arrival vaqtlarini kiriting.'); return }
        const dep = new Date(d.departureTime).getTime(); const arr = new Date(d.arrivalTime).getTime()
        if (!(dep < arr)) { setError('Arrival vaqti Departure dan keyin bo‘lishi kerak.'); return }
        const cp = Array.isArray(d.classPricing) ? d.classPricing : []
        const priced = cp.filter((x:any)=> x && x.classId && x.price && !Number.isNaN(Number(x.price)))
        if (priced.length === 0) { setError('Hech bo‘lmaganda bitta klass uchun narx kiriting.'); return }
      }
      await request(resource.base, { method: 'POST', body: JSON.stringify(createData) })
      setCreateData({}); await reload()
    } catch (e:any) { setError(niceErr(e)) }
  }

  const onUpdate = async (it:any) => {
    const id = it[idField]
    try { await request(`${resource.base}/${id}`, { method: 'PATCH', body: JSON.stringify(editing[id]) }); setEditing(p=>{const n={...p}; delete n[id]; return n}); await reload() } catch(e:any){ setError(niceErr(e)) }
  }

  const onDelete = async (it:any) => {
    const id = it[idField]
    try { await request(`${resource.base}/${id}`, { method: 'DELETE' }); await reload() } catch(e:any){ setError(niceErr(e)) }
  }

  return (
    <div>
      <div className="card">
        <h3>Yangi qo‘shish</h3>
        {resource.key === 'flights' ? (
          <FlightCreate createData={createData} setCreateData={setCreateData} />
        ) : (
          <div className="row">
            {resource.fields.map(f => (
              <div className="field" key={f.name} style={{minWidth: f.width || 180}}>
                <label>{f.label}</label>
                {f.type === 'number' ? (
                  <input type="number" value={createData[f.name] ?? ''} onChange={e=>setCreateData(p=>({...p, [f.name]: Number(e.target.value)}))} />
                ) : f.type === 'datetime' ? (
                  <input type="datetime-local" value={createData[f.name] ?? ''} onChange={e=>setCreateData(p=>({...p, [f.name]: e.target.value}))} />
                ) : (
                  <input value={createData[f.name] ?? ''} onChange={e=>setCreateData(p=>({...p, [f.name]: e.target.value}))} />
                )}
              </div>
            ))}
          </div>
        )}
        <button onClick={onCreate}>Qo‘shish</button>
      </div>

      {error && <div className="form error" style={{marginTop:8}}>{error}</div>}

      <div className="list">
        {loading ? <div className="muted">Yuklanmoqda...</div> : items.map((it:any) => (
          <div className="card" key={it[idField]}>
            <div className="row between">
              <div>
                <div className="title">{resource.label} #{it[idField]}</div>
              </div>
              <div className="actions">
                <button style={{marginRight:8}} onClick={()=>setEditing(p=>({...p, [it[idField]]: resource.fields.reduce((acc, f)=> ({...acc, [f.name]: it[f.name] ?? ''}), {})}))}>Tahrirlash</button>
                <button onClick={()=>onDelete(it)}>O‘chirish</button>
              </div>
            </div>
            {editing[it[idField]] && !resource.updateDisabled && (
              <div style={{marginTop:12}}>
                <div className="row">
                  {resource.fields.map(f => (
                    <div className="field" key={f.name} style={{minWidth: f.width || 180}}>
                      <label>{f.label}</label>
                      {f.type === 'number' ? (
                        <input type="number" value={editing[it[idField]][f.name] ?? ''} onChange={e=>setEditing(p=>({...p, [it[idField]]: {...p[it[idField]], [f.name]: Number(e.target.value)} }))} />
                      ) : f.type === 'datetime' ? (
                        <input type="datetime-local" value={editing[it[idField]][f.name] ?? ''} onChange={e=>setEditing(p=>({...p, [it[idField]]: {...p[it[idField]], [f.name]: e.target.value} }))} />
                      ) : (
                        <input value={editing[it[idField]][f.name] ?? ''} onChange={e=>setEditing(p=>({...p, [it[idField]]: {...p[it[idField]], [f.name]: e.target.value} }))} />
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={()=>onUpdate(it)}>Saqlash</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const [active, setActive] = useState(RESOURCES[0].key)
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
  const isSuper = user && user.role === 'SUPER_ADMIN'
  const resource = useMemo(() => RESOURCES.find(r => r.key === active)!, [active])
  if (!isAdmin) return <div className="card">Kirish taqiqlangan. Faqat adminlar uchun.</div>
  return (
    <div>
      <div className="card" style={{position:'sticky', top:68, zIndex:5}}>
        <h2>Admin panel</h2>
        <div className="row" style={{gap:8, flexWrap:'wrap'}}>
          {RESOURCES.map(r => (
            <button key={r.key} onClick={() => setActive(r.key)} style={{background: active===r.key ? '#2c6bed' : '#1d2a48'}}>{r.label}</button>
          ))}
        </div>
      </div>

      {isSuper && (
        <div className="card">
          <h3>Super admin: yangi admin qo‘shish</h3>
          <SuperAdminAddAdmin />
        </div>
      )}

      <CrudTable resource={resource} />

      <div className="card">
        <h3>Foydalanuvchi balansini o‘zgartirish (ADMIN)</h3>
        <AdjustBalance />
      </div>
    </div>
  )
}

function FlightCreate({ createData, setCreateData }: { createData: any; setCreateData: (fn: any)=>void }) {
  const [showClassCfg, setShowClassCfg] = useState(false)
  const [classList, setClassList] = useState<any[]>([])
  const [classCfg, setClassCfg] = useState<Record<number, { price?: string; seatLimit?: number }>>({})
  const [seatCounts, setSeatCounts] = useState<Record<number, number>>({})
  useEffect(() => { (async()=>{ try { const d = await request('/classes'); setClassList(d as any[])} catch{} })() }, [])

  // When parent posts, it will read createData and classCfg is local; so augment createData.classPricing live
  useEffect(() => {
    const arr = Object.entries(classCfg).map(([cid, cfg]) => ({ classId: Number(cid), ...cfg }))
    setCreateData((p:any)=> ({ ...p, classPricing: arr }))
  }, [classCfg])

  // Load seat counts per class when plane changes
  useEffect(() => {
    (async () => {
      try {
        const pid = createData?.planeId
        if (!pid) { setSeatCounts({}); return }
        const list = await request(`/seats?planeId=${pid}`)
        const counts: Record<number, number> = {}
        for (const s of (list as any[])) {
          const cid = Number(s.classId)
          counts[cid] = (counts[cid] || 0) + 1
        }
        setSeatCounts(counts)
      } catch { setSeatCounts({}) }
    })()
  }, [createData?.planeId])

  return (
    <>
      <div className="row">
        <div className="field"><label>Company</label><CompanySelect value={createData.companyId} onChange={(v:number)=>setCreateData((p:any)=>({...p, companyId:v}))} /></div>
        <div className="field"><label>Plane</label><PlaneSelect value={createData.planeId} onChange={(v:number)=>setCreateData((p:any)=>({...p, planeId:v}))} /></div>
        <div className="field" style={{minWidth:260}}><label>From Airport</label><AdminAirportSelect value={createData.originAirportId} onChange={(v:number)=>setCreateData((p:any)=>({...p, originAirportId:v}))} /></div>
        <div className="field" style={{minWidth:260}}><label>To Airport</label><AdminAirportSelect value={createData.destinationAirportId} onChange={(v:number)=>setCreateData((p:any)=>({...p, destinationAirportId:v}))} /></div>
        <div className="field"><label>Flight No.</label><input value={createData.flightNumber||''} onChange={e=>setCreateData((p:any)=>({...p, flightNumber:e.target.value}))} /></div>
        <div className="field"><label>Departure</label><input type="datetime-local" value={createData.departureTime||''} onChange={e=>setCreateData((p:any)=>({...p, departureTime:e.target.value}))} /></div>
        <div className="field"><label>Arrival</label><input type="datetime-local" value={createData.arrivalTime||''} onChange={e=>setCreateData((p:any)=>({...p, arrivalTime:e.target.value}))} /></div>
        <div className="field" style={{minWidth:220}}>
          <label>Klass sozlamalari</label>
          <button type="button" onClick={()=>setShowClassCfg(s=>!s)}>{showClassCfg ? 'Yopish' : 'Ochilish'}</button>
        </div>
      </div>
      {showClassCfg && (
        <div className="card" style={{marginTop:8}}>
          <div className="row" style={{gap:8}}>
            {classList.map((c:any)=> (
              <div key={c.id} className="field" style={{minWidth:240}}>
                <label>{c.name} ({c.code}) – Narx va limit {typeof seatCounts[c.id]==='number' ? `(o'rindiqlar: ${seatCounts[c.id]})` : ''}</label>
                <div className="row" style={{gap:6, alignItems:'center'}}>
                  <input placeholder="Narx (ixtiyoriy)" value={classCfg[c.id]?.price||''} onChange={e=>setClassCfg(p=>({ ...p, [c.id]: { ...(p[c.id]||{}), price: e.target.value } }))} />
                  <input placeholder={`Seat limit (<= ${seatCounts[c.id] ?? '...'})`} type="number" max={seatCounts[c.id] ?? undefined}
                    value={classCfg[c.id]?.seatLimit||''}
                    onChange={e=>{
                      let v = Number(e.target.value)
                      if (!Number.isFinite(v) || v <= 0) v = NaN as any
                      const max = seatCounts[c.id]
                      if (Number.isFinite(v) && typeof max === 'number' && v > max) v = max
                      setClassCfg(p=>({ ...p, [c.id]: { ...(p[c.id]||{}), seatLimit: Number.isFinite(v) ? v : undefined } }))
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function SuperAdminAddAdmin() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const onSubmit = async () => {
    setMsg(null); setErr(null)
    try { await request('/auth/admin/register', { method:'POST', body: JSON.stringify({ fullName, email, password }) }); setMsg('Admin qo‘shildi'); setFullName(''); setEmail(''); setPassword('') } catch(e:any){ setErr(niceErr(e)) }
  }
  return (
    <div>
      <div className="row">
        <div className="field"><label>To‘liq ism</label><input value={fullName} onChange={e=>setFullName(e.target.value)} /></div>
        <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="field"><label>Parol</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      </div>
      <button onClick={onSubmit}>Admin qo‘shish</button>
      {msg && <div className="muted" style={{marginTop:8}}>{msg}</div>}
      {err && <div className="form error" style={{marginTop:8}}>{err}</div>}
    </div>
  )
}

function AdjustBalance() {
  const [userId, setUserId] = useState<number | ''>('')
  const [amount, setAmount] = useState<string>('')
  const [mode, setMode] = useState<'increment' | 'decrement'>('increment')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const onSubmit = async () => {
    setMsg(null); setErr(null)
    if (!userId || !amount) { setErr('ID va summa kerak'); return }
    const numeric = Number(amount)
    if (!isFinite(numeric) || numeric <= 0) { setErr('Summani to‘g‘ri kiriting (musbat son)'); return }
    try { setLoading(true); await request(`/users/${userId}/balance`, { method:'POST', body: JSON.stringify({ amount: numeric, mode }) }); setMsg('Balans yangilandi'); setUserId(''); setAmount('') } catch(e:any){ setErr(niceErr(e)) } finally { setLoading(false) }
  }
  return (
    <div>
      <div className="grid-3">
        <div className="field"><label>Foydalanuvchi ID</label><input placeholder="Masalan: 12" type="number" value={userId} onChange={e=>setUserId(Number(e.target.value))} /></div>
        <div className="field"><label>Summasi</label><input placeholder="Masalan: 100000.00" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} /></div>
        <div className="field"><label>Mod</label>
          <div className="seg">
            <button type="button" className={mode==='increment'?'active':''} onClick={()=>setMode('increment')}>Qo‘shish</button>
            <button type="button" className={mode==='decrement'?'active':''} onClick={()=>setMode('decrement')}>Ayirish</button>
          </div>
        </div>
      </div>
      <div className="actions" style={{marginTop:8}}>
        <button onClick={onSubmit} disabled={loading}>{loading ? 'Yuklanmoqda…' : 'Yangilash'}</button>
        {msg && <div className="form success" style={{margin:0}}>{msg}</div>}
        {err && <div className="form error" style={{margin:0}}>{err}</div>}
      </div>
    </div>
  )
}




