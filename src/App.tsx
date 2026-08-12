import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import POS from './pages/POS'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Settings from './pages/Settings'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Login from './pages/Login'
import CashSession from './pages/CashSession'
import Setup from './pages/Setup'
import License from './pages/License'

function AppContent({ restricted }: { restricted: boolean }) {
  const { user } = useAuth()
  
  if (!user) {
    return <Login />
  }

  // If restricted, ONLY allow Settings (for Backup/Restore)
  if (restricted) {
    return (
      <Router>
        <Layout>
          <Routes>
            <Route path="*" element={<Navigate to="/settings" replace />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    )
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/pos" replace />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/cash" element={<CashSession />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default function App() {
  const [systemStatus, setSystemStatus] = useState<any>(null)
  
  const checkStatus = async () => {
    const status = await window.ipcRenderer.invoke('system-status')
    setSystemStatus(status)
  }

  useEffect(() => {
    checkStatus()
  }, [])

  if (!systemStatus) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-bold text-2xl">Loading BizPOS...</div>
  
  if (systemStatus.isFirstRun) {
    return <Setup onComplete={checkStatus} />
  }

  // If there's no valid license and they haven't logged in, they can login. 
  // We wrap AppContent in AuthProvider. If restricted is true, AppContent intercepts.
  // Wait, if it's restricted, we still want to show the License Activation screen!
  // But we want them to login first to restore backups!
  // Actually, we can show License screen globally, or let them login and then restrict.
  // Let's show License screen globally unless they are logged in.
  // If we wrap AuthProvider here, we can't easily hook into `useAuth` inside `App`.
  
  return (
    <AuthProvider>
      {!systemStatus.license?.valid && systemStatus.license?.restricted ? (
        <License installId={systemStatus.installId} onActivated={checkStatus} />
      ) : (
        <AppContent restricted={false} />
      )}
    </AuthProvider>
  )
}
