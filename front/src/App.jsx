import { useState, useEffect } from 'react'
import { LoginPage } from './pages/LoginPage'
import { PublicPage } from './pages/PublicPage'
import { DashboardPage } from './pages/DashboardPage'
import { SetPasswordPage } from './pages/SetPasswordPage'
import { useAuth } from './hooks/useAuth'
import { authService } from './services/api'
import './App.css'

function App() {
  const { token, admin, setAuthData } = useAuth()
  const [view, setView] = useState(() => {
    // Check if we have a password reset token in the URL
    const params = new URLSearchParams(window.location.search)
    if (params.has('token')) {
      return 'set-password'
    }
    return token ? 'dashboard' : 'public'
  })

  useEffect(() => {
    // Don't override if we're in the password reset flow
    const params = new URLSearchParams(window.location.search)
    if (params.has('token')) {
      return
    }
    
    if (token) {
      setView('dashboard')
    } else {
      setView('public')
    }
  }, [token])

  const handleLogin = (newToken, newAdmin) => {
    setAuthData(newToken, newAdmin)
    setView('dashboard')
  }

  const handleLogout = async () => {
    await authService.logout()
    setAuthData(null, null)
    setView('public')
  }

  return (
    <div className="app">
      {view === 'public' && <PublicPage />}
      {view === 'login' && <LoginPage onLogin={handleLogin} />}
      {view === 'set-password' && <SetPasswordPage setView={setView} />}
      {view === 'dashboard' && token && admin ? (
        <DashboardPage admin={admin} onLogout={handleLogout} />
      ) : null}

      {/* Floating admin button */}
      {view === 'public' && (
        <button
          className="admin-toggle"
          onClick={() => setView(token ? 'dashboard' : 'login')}
        >
          {token ? 'Dashboard' : '🔐'}
        </button>
      )}
    </div>
  )
}

export default App

