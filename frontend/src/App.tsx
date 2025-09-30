import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import type React from 'react'
import Login from './pages/Login'
import Search from './pages/Search'
import MyBookings from './pages/MyBookings'
import Admin from './pages/Admin'
import Home from './pages/Home'
import MyTickets from './pages/MyTickets'
import Loyalty from './pages/Loyalty'
import Navbar from './components/Navbar'

function Protected({ children }: { children: React.ReactElement }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/admin"
            element={
              <Protected>
                <Admin />
              </Protected>
            }
          />
          <Route
            path="/bookings"
            element={
              <Protected>
                <MyBookings />
              </Protected>
            }
          />
          <Route
            path="/tickets"
            element={
              <Protected>
                <MyTickets />
              </Protected>
            }
          />
          <Route
            path="/loyalty"
            element={
              <Protected>
                <Loyalty />
              </Protected>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
