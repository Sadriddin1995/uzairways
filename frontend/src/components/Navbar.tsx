import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export default function Navbar() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const { theme, toggle } = useTheme()
  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="brand">UzAirways</Link>
        <button onClick={toggle} title="Theme" style={{ marginRight: 12 }}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <Link to="/search" className={loc.pathname === '/search' ? 'active' : ''}>Qidiruv</Link>
        {user && <>
          <Link to="/bookings" className={loc.pathname === '/bookings' ? 'active' : ''}>Bronlarim</Link>
          <Link to="/tickets" className={loc.pathname === '/tickets' ? 'active' : ''}>Biletlarim</Link>
          <Link to="/loyalty" className={loc.pathname === '/loyalty' ? 'active' : ''}>Loyallik</Link>
        </>}
      </div>
      <div className="nav-right">
        {(user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) && (
          <Link to="/admin" className={loc.pathname === '/admin' ? 'active' : ''}>Admin</Link>
        )}
        {user ? (
          <>
            <span className="user">{user.fullName}</span>
            <button onClick={logout}>Chiqish</button>
          </>
        ) : (
          <Link to="/login" className={loc.pathname === '/login' ? 'active' : ''}>Kirish</Link>
        )}
      </div>
    </nav>
  )
}

