import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { Wallet, AlertTriangle, ArrowRightLeft, Info, CheckCircle, AlertCircle } from 'lucide-react'

export default function CashSession() {
  const { user } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [breakdown, setBreakdown] = useState<any>(null)
  
  // Forms
  const [openingCash, setOpeningCash] = useState('')
  const [actualCash, setActualCash] = useState('')
  const [closingNote, setClosingNote] = useState('')

  // Modals
  const [showMovement, setShowMovement] = useState<'CASH_IN' | 'CASH_OUT' | null>(null)
  const [movementAmount, setMovementAmount] = useState('')
  const [movementReason, setMovementReason] = useState('')
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  // Session Opening UI State
  const [isOpening, setIsOpening] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = async () => {
    try {
      const active = await window.ipcRenderer.invoke('cash-active-session')
      setSession(active)
      if (active) {
        const _breakdown = await window.ipcRenderer.invoke('cash-breakdown', active.id)
        setBreakdown(_breakdown)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpening(true)
    try {
      await window.ipcRenderer.invoke('cash-open-session', parseFloat(openingCash || '0'))
      setSuccess(true)
      setTimeout(() => {
        loadSession()
      }, 1000)
    } catch (err: any) {
      alert(err.message)
      setIsOpening(false)
    }
  }

  const handleCloseSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowCloseConfirm(true)
  }

  const confirmCloseSession = async () => {
    try {
      const cleanActualCash = actualCash ? parseFloat(actualCash.replace(/,/g, '')) : 0
      await window.ipcRenderer.invoke('cash-close-session', { actualCash: cleanActualCash, note: closingNote })
      setSession(null)
      setBreakdown(null)
      setActualCash('')
      setClosingNote('')
      setShowCloseConfirm(false)
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

  const handleActualCashBlur = () => {
    if (actualCash) {
      const cleanVal = actualCash.replace(/,/g, '')
      const parsed = parseFloat(cleanVal)
      if (!isNaN(parsed)) {
        setActualCash(parsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
      }
    }
  }

  if (!session) {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-md rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
              <Wallet size={32} />
            </div>
            <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Open Cash Session</CardTitle>
            <p className="text-slate-500 mt-2 font-medium">Start a new cash session for today's sales.</p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Cashier</p>
                <p className="font-semibold text-slate-800">{user?.username}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Date</p>
                <p className="font-semibold text-slate-800">{today}</p>
              </div>
            </div>

            <form onSubmit={handleOpenSession} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Opening Cash</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold text-xl">₱</span>
                  </div>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    required
                    value={openingCash}
                    onChange={e => setOpeningCash(e.target.value)}
                    className="pl-10 h-16 text-2xl font-black text-slate-800 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
                    placeholder="0.00"
                    disabled={isOpening || success}
                  />
                </div>
              </div>

              {success ? (
                <div className="w-full h-12 bg-emerald-50 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-200">
                  <span className="text-lg">🟢</span> Cash session opened successfully.
                </div>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isOpening || !openingCash} 
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:hover:shadow-md"
                >
                  {isOpening ? 'Opening session...' : 'Open Cash Session'}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!breakdown) return null // loading breakdown

  const expectedCash = breakdown.expectedCash
  const parsedActualCash = actualCash ? parseFloat(actualCash.replace(/,/g, '')) : 0
  const variance = actualCash && !isNaN(parsedActualCash) ? Math.round((parsedActualCash - expectedCash) * 100) / 100 : 0
  const isShort = variance < 0
  const isOver = variance > 0
  const isBalanced = variance === 0 && actualCash !== ''

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Active Cash Session</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold mr-2">{session.sessionNo}</span>
            Opened by <span className="font-bold">{user?.username}</span> at {new Date(session.openedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 font-bold h-10 px-6 rounded-xl transition-all" onClick={() => setShowMovement('CASH_IN')}>+ Cash In</Button>
          <Button variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 font-bold h-10 px-6 rounded-xl transition-all" onClick={() => setShowMovement('CASH_OUT')}>- Cash Out</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Breakdown & Logs */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest">Cash Drawer Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-5 space-y-3 font-medium text-slate-700">
                <div className="flex justify-between">
                  <span>Opening Cash</span>
                  <span>₱ {breakdown.openingCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>(+) Cash Sales</span>
                  <span>+ ₱ {breakdown.cashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>(+) Cash In</span>
                  <span>+ ₱ {breakdown.cashIn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>(-) Cash Out</span>
                  <span>- ₱ {breakdown.cashOut.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <span className="font-bold uppercase tracking-widest text-sm">Expected Cash</span>
                <span className="text-2xl font-black">= ₱ {breakdown.expectedCash.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-slate-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-500">
                <Info size={20} className="text-blue-500" />
                <span className="text-sm font-medium">Non-Cash Sales (Not in drawer)</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                GCash: ₱{breakdown.nonCashSales.gcash.toFixed(2)} &nbsp;|&nbsp; Card: ₱{breakdown.nonCashSales.card.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Cash Log</CardTitle>
            </CardHeader>
            <CardContent>
              {breakdown.movements.length === 0 ? (
                <div className="text-center py-6 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <ArrowRightLeft size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-sm">No cash movements yet.</p>
                  <p className="text-xs mt-1">Use Cash In / Out for petty cash.</p>
                </div>
              ) : (
                <div className="space-y-3 mt-2 max-h-48 overflow-y-auto pr-2">
                  {breakdown.movements.map((mov: any) => (
                    <div key={mov.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{mov.reason}</p>
                        <p className="text-xs text-slate-500">{new Date(mov.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <span className={`font-bold ${mov.type === 'CASH_IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {mov.type === 'CASH_IN' ? '+' : '-'} ₱{mov.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Reconciliation */}
        <div>
          <Card className="rounded-2xl shadow-md border-0 bg-white sticky top-6">
            <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-2xl pb-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest">End of Shift Reconciliation</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCloseSessionSubmit} className="space-y-6">
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Actual Cash (Counted)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold text-2xl">₱</span>
                    </div>
                    <Input 
                      type="text" 
                      required
                      value={actualCash} 
                      onChange={e => setActualCash(e.target.value.replace(/[^0-9.,]/g, ''))} 
                      onBlur={handleActualCashBlur}
                      className="pl-12 h-20 text-4xl font-black text-slate-800 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm tracking-tight"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Dynamic Difference Indicator */}
                {actualCash && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                    isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                    isShort ? 'bg-rose-50 border-rose-200 text-rose-700' : 
                    'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    {isBalanced && <CheckCircle size={24} className="text-emerald-500" />}
                    {isShort && <AlertTriangle size={24} className="text-rose-500" />}
                    {isOver && <Info size={24} className="text-amber-500" />}
                    
                    <div className="flex-1 font-bold text-sm">
                      {isBalanced && 'Balanced (₱0.00)'}
                      {isShort && `Short by -₱${Math.abs(variance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      {isOver && `Over by +₱${variance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </div>
                  </div>
                )}

                {!isBalanced && actualCash && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reason for Variance</label>
                    <Input 
                      required
                      value={closingNote} 
                      onChange={e => setClosingNote(e.target.value)} 
                      className="h-12 rounded-xl"
                      placeholder="E.g. Missing change, given wrong change"
                    />
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={!isBalanced && closingNote.trim().length < 3}
                    className="w-full h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg tracking-wide transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    CLOSE SESSION
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Movement Modal */}
      {showMovement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm rounded-2xl shadow-2xl border-0">
            <CardHeader className="bg-slate-50 rounded-t-2xl border-b border-slate-100 pb-4">
              <CardTitle className={`text-lg font-black tracking-tight ${showMovement === 'CASH_IN' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {showMovement === 'CASH_IN' ? 'Add Cash In' : 'Record Cash Out'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleMovement} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount (₱)</label>
                  <Input type="number" step="0.01" min="0.01" required value={movementAmount} onChange={e=>setMovementAmount(e.target.value)} autoFocus className="h-12 text-lg font-bold rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reason</label>
                  <Input required value={movementReason} onChange={e=>setMovementReason(e.target.value)} placeholder="E.g. Petty cash, water refill..." className="h-12 rounded-xl" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setShowMovement(null)}>Cancel</Button>
                  <Button type="submit" className={`flex-1 h-12 rounded-xl font-bold text-white shadow-md ${showMovement === 'CASH_IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>Confirm</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Close Session Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-md rounded-2xl shadow-2xl border-0 overflow-hidden">
            <div className="bg-slate-900 p-6 text-center text-white">
              <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
              <h2 className="text-2xl font-black tracking-tight">Close Cash Session?</h2>
              <p className="text-slate-400 mt-2 text-sm font-medium">Closing this session will finalize today's shift and print the X-Report summary.</p>
            </div>
            
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected</p>
                <p className="font-bold text-slate-900 mt-1">₱{expectedCash.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actual</p>
                <p className="font-bold text-slate-900 mt-1">₱{parsedActualCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variance</p>
                <p className={`font-bold mt-1 ${isBalanced ? 'text-emerald-600' : isShort ? 'text-rose-600' : 'text-amber-600'}`}>
                  {variance > 0 ? '+' : ''}₱{variance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="p-6 flex gap-3 bg-white">
              <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setShowCloseConfirm(false)}>Cancel</Button>
              <Button type="button" onClick={confirmCloseSession} className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md">
                Confirm & Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
