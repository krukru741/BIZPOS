import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Store, ShieldCheck, ArrowRight, CheckCircle2, Eye, EyeOff, Rocket } from 'lucide-react'

export default function Setup({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [ownerName, setOwnerName] = useState('')
  
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isStep1Valid = businessName.trim().length > 0 && ownerName.trim().length > 0
  
  const passLength = adminPassword.length >= 8
  const passMatch = adminPassword === confirmPassword && adminPassword.length > 0
  const isStep2Valid = adminUsername.trim().length > 0 && passLength && passMatch

  const handleNext1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isStep1Valid) return
    setStep(2)
  }

  const handleNext2 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isStep2Valid) return

    setLoading(true)
    try {
      await window.ipcRenderer.invoke('auth-setup-first-run', {
        businessName: businessName.trim(), 
        address: address.trim(), 
        ownerName: ownerName.trim(), 
        adminUsername: adminUsername.trim(), 
        adminPassword
      })
      setStep(3)
    } catch (err: any) {
      alert('Setup failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    onComplete()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[540px] shadow-xl border-slate-200">
        <CardHeader className="text-center pb-5 pt-8 bg-white rounded-t-xl border-b border-slate-100">
          <Store className="w-10 h-10 mx-auto mb-3 text-blue-600" />
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Set up your business</CardTitle>
          
          <div className="flex items-center justify-center mt-5 text-sm font-medium text-slate-400">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : ''}`}>
              {step > 1 ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <span className="mr-1.5 text-lg">●</span>}
              Business
            </div>
            <div className={`w-12 h-px mx-3 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : ''}`}>
              {step > 2 ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <span className="mr-1.5 text-lg">{step === 2 ? '●' : '○'}</span>}
              Security
            </div>
            <div className={`w-12 h-px mx-3 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : ''}`}>
              {step > 3 ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <span className="mr-1.5 text-lg">{step === 3 ? '●' : '○'}</span>}
              Finish
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 bg-white rounded-b-xl">
          {step === 1 && (
            <form onSubmit={handleNext1} className="space-y-5">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h3 className="text-lg font-medium text-slate-800">Business Information</h3>
                  <p className="text-sm text-slate-500 mt-0.5">This information will appear on receipts and reports.</p>
                </div>
                <span className="text-xs font-medium text-slate-400">* Required</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Business Name *</label>
                <p className="text-xs text-slate-500 mb-1">The name shown on your receipts and reports.</p>
                <div className="relative">
                  <Input 
                    value={businessName} 
                    onChange={e => setBusinessName(e.target.value)} 
                    placeholder="e.g., Juan Mini Grocery" 
                    autoFocus 
                  />
                  {businessName.trim().length > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Business Address</label>
                <Input 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder="e.g., Purok 1, Main St., Prosperidad, Agusan del Sur" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Owner / Manager Name *</label>
                <p className="text-xs text-slate-500 mb-1">The person responsible for managing this BizPOS account.</p>
                <div className="relative">
                  <Input 
                    value={ownerName} 
                    onChange={e => setOwnerName(e.target.value)} 
                    placeholder="e.g., Juan Dela Cruz" 
                  />
                  {ownerName.trim().length > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />}
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={!isStep1Valid}
                  className={`w-full h-11 text-base font-medium group shadow-sm transition-all ${isStep1Valid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-500 shadow-none'}`}
                >
                  Continue to Security 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext2} className="space-y-4">
              <div className="mb-2">
                <h3 className="text-lg font-medium text-slate-800">Security</h3>
                <p className="text-sm text-slate-500 mt-0.5">Set up your login credentials.</p>
              </div>

              <div className="flex items-start gap-3 text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4">
                <ShieldCheck className="w-5 h-5 shrink-0" /> 
                <span className="text-sm font-medium leading-tight mt-0.5">Create your administrator account. This account will have full access to manage your store.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Administrator Username *</label>
                <div className="relative">
                  <Input 
                    required 
                    value={adminUsername} 
                    onChange={e=>setAdminUsername(e.target.value)} 
                    placeholder="e.g., juanadmin"
                    autoFocus
                  />
                  {adminUsername.trim().length > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Password *</label>
                <p className="text-xs text-slate-500 mb-1">Use at least 8 characters.</p>
                <div className="relative">
                  <Input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    value={adminPassword} 
                    onChange={e=>setAdminPassword(e.target.value)} 
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {adminPassword.length > 0 && !passLength && <p className="text-xs text-amber-500 mt-1">⚠ Password must be at least 8 characters.</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Confirm Password *</label>
                <div className="relative">
                  <Input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={e=>setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                    className={confirmPassword.length > 0 && confirmPassword !== adminPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {passMatch && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />}
                </div>
                {confirmPassword.length > 0 && confirmPassword !== adminPassword && <p className="text-xs text-red-500 mt-1">⚠ Passwords do not match.</p>}
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline" className="flex-1 h-11 font-medium" onClick={() => setStep(1)} disabled={loading}>Back</Button>
                <Button 
                  type="submit" 
                  disabled={loading || !isStep2Valid}
                  className={`flex-1 h-11 text-base font-medium shadow-sm transition-all ${isStep2Valid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-500 shadow-none'}`}
                >
                  {loading ? 'Setting up...' : 'Continue to Finish →'}
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-5">
              <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <Rocket className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Setup Complete!</h3>
                <p className="text-slate-500 mt-1">Your BizPOS is now ready to use.</p>
              </div>
              <Button 
                onClick={handleFinish}
                className="w-full h-11 text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                Launch BizPOS
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
