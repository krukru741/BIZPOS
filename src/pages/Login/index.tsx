import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Leaf, CheckCircle2, UserCircle2, ShieldCheck, Check } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'cashier'>('admin')
  const { setUser } = useAuth()

  const handleRoleSelect = (role: 'admin' | 'cashier') => {
    setSelectedRole(role)
    setUsername(role)
    setPassword('')
  }

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
    <div className="min-h-screen w-full flex bg-white font-sans">
      
      {/* Left Panel - Dark Gradient & Branding */}
      <div className="hidden lg:flex flex-col w-[55%] bg-gradient-to-br from-[#0f172a] via-[#112a28] to-[#0f4d30] relative overflow-hidden items-center justify-center">
        
        {/* Concentric Circles Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="absolute w-[300px] h-[300px] rounded-full border border-emerald-400"></div>
          <div className="absolute w-[450px] h-[450px] rounded-full border border-emerald-400"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full border border-emerald-400"></div>
          <div className="absolute w-[750px] h-[750px] rounded-full border border-emerald-400"></div>
          <div className="absolute w-[900px] h-[900px] rounded-full border border-emerald-400"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center max-w-lg text-center px-8">
          <div className="w-20 h-20 rounded-2xl border border-emerald-500 bg-emerald-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Leaf className="w-10 h-10 text-emerald-400" />
          </div>
          
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">BIZPOS</h1>
          
          <p className="text-slate-300 text-lg mb-10 font-medium leading-relaxed">
            Complete retail store management. Billing, inventory, reports — all in one place.
          </p>
          
          <div className="w-full space-y-4 text-left pl-8">
            <div className="flex items-center text-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-4 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="font-medium">Lightning-fast POS checkout</span>
            </div>
            <div className="flex items-center text-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-4 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="font-medium">Real-time inventory tracking</span>
            </div>
            <div className="flex items-center text-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-4 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="font-medium">Role-based access control</span>
            </div>
            <div className="flex items-center text-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-4 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="font-medium">Detailed sales reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-12 sm:px-24 xl:px-32 relative">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-[32px] font-extrabold text-slate-900 mb-2 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 font-medium">Sign in to your store dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Role Selector */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Sign in as</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border font-semibold transition-all ${
                    selectedRole === 'admin' 
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600' 
                      : 'border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('cashier')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border font-semibold transition-all ${
                    selectedRole === 'cashier' 
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600' 
                      : 'border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
                >
                  <UserCircle2 className="w-4 h-4" />
                  Cashier
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-100 flex items-center">
                <span className="mr-2">⚠</span> {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Username</label>
              <Input 
                autoFocus
                value={username} 
                onChange={(e) => {
                  setUsername(e.target.value)
                  if(e.target.value !== 'admin' && e.target.value !== 'cashier') setSelectedRole('' as any)
                }} 
                placeholder="Enter your username"
                className="h-12 bg-white border-slate-200 text-base rounded-lg focus-visible:ring-emerald-500"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Forgot password?</a>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="h-12 bg-white border-slate-200 text-base rounded-lg focus-visible:ring-emerald-500 pr-10"
                  disabled={loading}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#1bc168] focus:ring-[#1bc168] cursor-pointer" />
                <span className="ml-2 text-sm font-medium text-slate-600">Remember me for 30 days</span>
              </label>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className={`w-full h-12 text-base font-bold rounded-lg shadow-md transition-all ${
                  isFormValid 
                    ? 'bg-[#1bc168] hover:bg-[#16a357] text-white' 
                    : 'bg-emerald-100 text-emerald-400 cursor-not-allowed hover:bg-emerald-100'
                }`}
                disabled={loading || !isFormValid}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
            
            <div className="text-center pt-2">
               <p className="text-sm font-medium text-emerald-600">BizPOS: Use your local credentials</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
