import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { Store } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const u = await window.ipcRenderer.invoke('auth-login', { username, password })
      setUser(u)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center text-blue-600">
        <Store size={48} className="mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight">BIZPOS</h1>
        <p className="text-slate-500 font-medium tracking-widest uppercase mt-2">Juan Mini Grocery</p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="pt-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Username</label>
              <Input 
                autoFocus
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter your username"
                className="h-12 bg-slate-50 text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                className="h-12 bg-slate-50 text-lg"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold">
              SIGN IN
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
