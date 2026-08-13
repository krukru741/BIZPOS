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

function AppContent({ restricted, businessName }: { restricted?: boolean, businessName?: string }) {
  const { user } = useAuth()

  if (!user) {
    return <Login businessName={businessName} />
  }

  if (restricted) {
    return (
      <Layout>
        <Routes>
          <Route path="*" element={<Navigate to="/settings" replace />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    )
  }

  return (
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

  return (
    <Router>
      {systemStatus.isFirstRun ? (
        <Setup onComplete={checkStatus} />
      ) : (
        <AuthProvider>
          {!systemStatus.license?.valid && systemStatus.license?.restricted ? (
            <License installId={systemStatus.installId} onActivated={checkStatus} />
          ) : (
            <AppContent restricted={false} businessName={systemStatus.businessName} />
          )}
        </AuthProvider>
      )}
    </Router>
  )
}