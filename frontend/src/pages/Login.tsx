import type { FormEvent } from 'react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login, register } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'login') await login(email, password)
      else await register(fullName, email, password)
      nav('/search')
    } catch (e: any) {
      setError(e.message || 'Xatolik yuz berdi')
    }
  }

  return (
    <div className="card form">
      <h2>{mode === 'login' ? 'Kirish' : 'Ro‘yxatdan o‘tish'}</h2>
      <form onSubmit={onSubmit}>
        {mode === 'register' && (
          <div className="field">
            <label>To‘liq ism</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
        )}
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Parol</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">{mode === 'login' ? 'Kirish' : 'Ro‘yxatdan o‘tish'}</button>
      </form>
      <div className="muted">
        {mode === 'login' ? (
          <span>Hisobingiz yo‘qmi? <button className="link" onClick={() => setMode('register')}>Ro‘yxatdan o‘ting</button></span>
        ) : (
          <span>Allaqachon ro‘yxatdan o‘tganmisiz? <button className="link" onClick={() => setMode('login')}>Kiring</button></span>
        )}
      </div>
    </div>
  )
}
