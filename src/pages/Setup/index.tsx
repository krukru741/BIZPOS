import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Rocket, ShieldCheck, CheckCircle } from 'lucide-react'

export default function Setup({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [ownerName, setOwnerName] = useState('')
  
  const [adminUsername, setAdminUsername] = useState('admin')
  const [adminPassword, setAdminPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adminPassword !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    setLoading(true)
    try {
      await window.ipcRenderer.invoke('auth-setup-first-run', {
        businessName, address, ownerName, adminUsername, adminPassword
      })
      // Trigger a backup immediately
      await window.ipcRenderer.invoke('backup-create')
      onComplete()
    } catch (err: any) {
      alert('Setup failed: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center pb-8 pt-10 bg-slate-900 text-white rounded-t-xl">
          <Rocket className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <CardTitle className="text-3xl tracking-tight">Welcome to BizPOS</CardTitle>
          <p className="text-slate-400 mt-2">Let's set up your business.</p>
        </CardHeader>

        <CardContent className="p-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Business Name</label>
                <Input required value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="e.g., Juan Mini Grocery" autoFocus />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Business Address</label>
                <Input required value={address} onChange={e=>setAddress(e.target.value)} placeholder="e.g., Main St, City" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Owner Name</label>
                <Input required value={ownerName} onChange={e=>setOwnerName(e.target.value)} placeholder="e.g., Juan Dela Cruz" />
              </div>
              <Button type="submit" className="w-full h-12 text-lg">Continue to Security</Button>
            </form>
          ) : (
            <form onSubmit={handleFinish} className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded mb-6">
                <ShieldCheck /> <span className="text-sm font-medium">Create your master admin account.</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Admin Username</label>
                <Input required value={adminUsername} onChange={e=>setAdminUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <Input required type="password" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Confirm Password</label>
                <Input required type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(1)} disabled={loading}>Back</Button>
                <Button type="submit" className="flex-1 h-12 text-lg" disabled={loading}>
                  {loading ? 'Setting up...' : 'START USING BIZPOS'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
