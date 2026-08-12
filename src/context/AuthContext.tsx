import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type User = {
  id: string
  username: string
  role: string
  mustChangePassword?: boolean
}

type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const u = await window.ipcRenderer.invoke('auth-current')
      setUser(u)
    } catch (e) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await window.ipcRenderer.invoke('auth-logout')
    setUser(null)
  }

  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>

  return (
    <AuthContext.Provider value={{ user, setUser, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
