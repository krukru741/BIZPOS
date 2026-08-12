import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LockKeyhole, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function License({ installId, onActivated }: { installId: string, onActivated: () => void }) {
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleActivate = async () => {
    setLoading(true)
    try {
      await window.ipcRenderer.invoke('license-activate', licenseKey)
      onActivated()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center pb-6">
          <LockKeyhole className="w-16 h-16 mx-auto mb-4 text-rose-500" />
          <CardTitle className="text-2xl font-bold tracking-tight">License Activation Required</CardTitle>
          <p className="text-slate-500 mt-2 text-sm">BizPOS is currently running in restricted mode.</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 bg-slate-100 rounded-md border border-slate-200 text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Your Installation ID</p>
            <p className="font-mono text-lg font-bold text-slate-800">{installId}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Paste License Token</label>
            <Textarea 
              rows={5}
              value={licenseKey}
              onChange={e=>setLicenseKey(e.target.value)}
              className="font-mono text-xs"
              placeholder='{"licenseId": "...", "signature": "..."}'
            />
          </div>

          <Button onClick={handleActivate} className="w-full h-12 text-lg" disabled={loading || !licenseKey}>
            {loading ? 'Activating...' : 'Activate License'}
          </Button>

          {/* If the user is an admin, they can access backup and restore even if unlicensed */}
          {user?.role === 'ADMIN' && (
            <div className="pt-6 border-t flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-600 text-sm font-bold mb-2">
                <AlertTriangle size={16} /> Restricted Access Available
              </div>
              <Button variant="outline" onClick={() => navigate('/settings')}>Open Settings (Backup & Restore)</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
