import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { Wallet, AlertTriangle, ArrowRightLeft } from 'lucide-react'

export default function CashSession() {
  const { user } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [expectedCash, setExpectedCash] = useState(0)
  
  // Forms
  const [openingCash, setOpeningCash] = useState('')
  const [actualCash, setActualCash] = useState('')
  const [closingNote, setClosingNote] = useState('')

  // Modals (simple state for now)
  const [showMovement, setShowMovement] = useState<'CASH_IN' | 'CASH_OUT' | null>(null)
  const [movementAmount, setMovementAmount] = useState('')
  const [movementReason, setMovementReason] = useState('')

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = async () => {
    try {
      const active = await window.ipcRenderer.invoke('cash-active-session')
      setSession(active)
      if (active) {
        const expected = await window.ipcRenderer.invoke('cash-expected', active.id)
        setExpectedCash(expected)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await window.ipcRenderer.invoke('cash-open-session', parseFloat(openingCash || '0'))
      setOpeningCash('')
      loadSession()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCloseSession = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await window.ipcRenderer.invoke('cash-close-session', { actualCash: parseFloat(actualCash || '0'), note: closingNote })
      setSession(null)
      setActualCash('')
      setClosingNote('')
      loadSession()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await window.ipcRenderer.invoke('cash-movement', {
        type: showMovement,
        amount: parseFloat(movementAmount),
        reason: movementReason,
        note: ''
      })
      setShowMovement(null)
      setMovementAmount('')
      setMovementReason('')
      loadSession()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl flex flex-col items-center gap-4">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Wallet size={32} /></div>
              Open Cash Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOpenSession} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Opening Cash (₱)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  required
                  value={openingCash} 
                  onChange={e => setOpeningCash(e.target.value)} 
                  className="h-12 text-2xl text-center font-bold"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold">OPEN SESSION</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const variance = parseFloat(actualCash || '0') - expectedCash

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Cash Session</h1>
          <p className="text-slate-500">{session.sessionNo} • Opened at {new Date(session.openedAt).toLocaleTimeString()}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50" onClick={() => setShowMovement('CASH_IN')}>+ Cash In</Button>
          <Button variant="outline" className="text-rose-600 border-rose-200 bg-rose-50" onClick={() => setShowMovement('CASH_OUT')}>- Cash Out</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>End of Shift Reconciliation</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCloseSession} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-medium text-slate-600 pb-4 border-b">
                  <span>Expected Cash</span>
                  <span className="font-bold text-black">₱{expectedCash.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Actual Cash (Counted)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  required
                  value={actualCash} 
                  onChange={e => setActualCash(e.target.value)} 
                  className="h-14 text-3xl font-bold text-center"
                />
              </div>

              {actualCash && (
                <div className={`p-4 rounded-md flex justify-between items-center ${variance === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  <span className="font-bold">Variance</span>
                  <span className="text-xl font-bold">{variance > 0 ? '+' : ''}₱{variance.toFixed(2)}</span>
                </div>
              )}

              {variance !== 0 && actualCash && (
                 <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700">Reason for Variance</label>
                 <Input 
                   required
                   value={closingNote} 
                   onChange={e => setClosingNote(e.target.value)} 
                   placeholder="E.g. Missing change, given wrong change"
                 />
               </div>
              )}

              <Button type="submit" className="w-full h-12 text-lg font-bold" variant="destructive">CLOSE SESSION</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
             <CardContent className="pt-6">
               <div className="flex justify-between items-center">
                 <span className="text-slate-500 font-medium">Opening Cash</span>
                 <span className="font-bold text-lg">₱{session.openingCash.toFixed(2)}</span>
               </div>
             </CardContent>
          </Card>
          
          <Card className="bg-slate-50 border-dashed border-2">
             <CardContent className="pt-6 text-center text-slate-500">
               <ArrowRightLeft className="mx-auto mb-2 opacity-50" />
               <p className="text-sm">Record petty cash payouts or additional change funds using the Cash In/Out buttons above.</p>
             </CardContent>
          </Card>
        </div>
      </div>

      {showMovement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>{showMovement === 'CASH_IN' ? 'Cash In' : 'Cash Out'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMovement} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Amount (₱)</label>
                  <Input type="number" step="0.01" min="0.01" required value={movementAmount} onChange={e=>setMovementAmount(e.target.value)} autoFocus />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Reason</label>
                  <Input required value={movementReason} onChange={e=>setMovementReason(e.target.value)} placeholder="E.g. Petty cash, water refill..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowMovement(null)}>Cancel</Button>
                  <Button type="submit" className={`flex-1 ${showMovement==='CASH_IN' ? 'bg-emerald-600' : 'bg-rose-600'}`}>Confirm</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
