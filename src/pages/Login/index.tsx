import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { Store, Eye, EyeOff } from 'lucide-react'

export default function Login({ businessName = 'BizPOS' }: { businessName?: string }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) return

    setError('')
    setLoading(true)
    try {
      const u = await window.ipcRenderer.invoke('auth-login', { username, password })
      setUser(u)
    } catch (err: any) {
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  const isFormValid = username.trim().length > 0 && password.length > 0

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-6 text-center text-blue-600">
        <Store size={48} className="mx-auto mb-3" />
        <h1 className="text-3xl font-bold tracking-tight">BIZPOS</h1>
        <p className="text-slate-500 text-sm font-semibold tracking-wider mt-1">{businessName}</p>
      </div>

      <Card className="w-full max-w-[420px] shadow-xl border border-slate-200">
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-xl font-bold text-slate-800">Welcome back</CardTitle>
          <p className="text-slate-500 text-sm mt-1">Sign in to continue to BizPOS.</p>
        </CardHeader>
        <CardContent className="pt-6 pb-8 px-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-100 flex items-center">
                <span className="mr-2">⚠</span> {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Username</label>
              <Input 
                autoFocus
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter username"
                className="h-11 bg-slate-50 text-base"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter password"
                  className="h-11 bg-slate-50 text-base"
                  disabled={loading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <Button 
                type="submit" 
                className={`w-full h-11 text-base font-medium shadow-sm transition-all ${isFormValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-500 hover:bg-slate-200'}`}
                disabled={loading || !isFormValid}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-slate-400 text-sm font-medium">
        BizPOS v1.0 • Local POS
      </div>
    </div>
  )
}
