import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Printer, Search, XCircle, AlertCircle } from 'lucide-react'

export default function Sales() {
  const [sales, setSales] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({})
  const [selectedSale, setSelectedSale] = useState<any | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('TODAY')
  const [cashierFilter, setCashierFilter] = useState('ALL')
  
  // Void Modal State
  const [voidSaleTarget, setVoidSaleTarget] = useState<any | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [isVoiding, setIsVoiding] = useState(false)

  useEffect(() => {
    loadSales()
    loadSettings()
  }, [])

  const loadSales = async () => {
    try {
      const res = await window.ipcRenderer.invoke('get-sales')
      setSales(res)
    } catch (err) {
      console.error(err)
    }
  }

  const loadSettings = async () => {
    const res = await window.ipcRenderer.invoke('get-settings')
    setSettings(res)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleVoidSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!voidSaleTarget) return
    setIsVoiding(true)
    try {
      await window.ipcRenderer.invoke('void-sale', { saleId: voidSaleTarget.id, reason: voidReason })
      setVoidSaleTarget(null)
      setVoidReason('')
      loadSales()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsVoiding(false)
    }
  }

  // Filter Logic
  const filteredSales = sales.filter(s => {
    // 1. Search Query
    if (searchQuery && !s.transactionNo.toLowerCase().includes(searchQuery.toLowerCase())) return false

    // 2. Date Filter
    const saleDate = new Date(s.createdAt)
    const today = new Date()
    today.setHours(0,0,0,0)
    
    if (dateFilter === 'TODAY') {
      if (saleDate < today) return false
    } else if (dateFilter === 'YESTERDAY') {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (saleDate < yesterday || saleDate >= today) return false
    }

    // 3. Cashier Filter
    if (cashierFilter !== 'ALL') {
      const cashierName = s.cashSession?.openedBy?.username || 'Unknown'
      if (cashierName !== cashierFilter) return false
    }

    return true
  })

  // Extract unique cashiers for the filter dropdown
  const uniqueCashiers = Array.from(new Set(sales.map(s => s.cashSession?.openedBy?.username || 'Unknown')))

  // Calculate Metrics strictly based on filtered active sales
  const activeFilteredSales = filteredSales.filter(s => s.status !== 'VOIDED')
  const totalAmount = activeFilteredSales.reduce((sum, s) => sum + s.netAmount, 0)
  const itemsSold = activeFilteredSales.reduce((sum, s) => sum + s.items.reduce((iSum: number, item: any) => iSum + item.quantity, 0), 0)

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      <div className="print:hidden">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Sales History</h1>
        
        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-sm border-slate-100">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
              <h2 className="text-3xl font-black text-slate-800">₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-100">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Transactions</p>
              <h2 className="text-3xl font-black text-slate-800">{activeFilteredSales.length}</h2>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-100">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Items Sold</p>
              <h2 className="text-3xl font-black text-slate-800">{itemsSold}</h2>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search Transaction No..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)}
              className="h-9 px-3 py-1 rounded-md border border-slate-200 bg-white text-sm"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
            </select>
            
            <select 
              value={cashierFilter} 
              onChange={e => setCashierFilter(e.target.value)}
              className="h-9 px-3 py-1 rounded-md border border-slate-200 bg-white text-sm"
            >
              <option value="ALL">All Cashiers</option>
              {uniqueCashiers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <Card className="shadow-sm border-slate-100">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction No.</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400">No transactions found.</TableCell></TableRow>
                ) : filteredSales.map(sale => {
                  const isVoided = sale.status === 'VOIDED'
                  return (
                    <TableRow key={sale.id} className={isVoided ? 'opacity-60 bg-slate-50' : ''}>
                      <TableCell>{new Date(sale.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                      <TableCell className={`font-mono font-bold text-sm ${isVoided ? 'line-through text-slate-400' : 'text-slate-800'}`}>{sale.transactionNo}</TableCell>
                      <TableCell className="font-medium text-slate-600">{sale.cashSession?.openedBy?.username || 'Unknown'}</TableCell>
                      <TableCell>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">{sale.payment?.method || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold ${isVoided ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                          {sale.status}
                        </span>
                      </TableCell>
                      <TableCell className={`font-bold ${isVoided ? 'text-slate-400' : ''}`}>₱{sale.netAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => setSelectedSale(sale)}>View Details</Button>
                          {!isVoided && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => setVoidSaleTarget(sale)}>
                              Void
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Sale Details Modal / Printable Receipt */}
      <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
        <DialogContent className="sm:max-w-[400px] print:w-[80mm] print:shadow-none print:border-none print:m-0 print:p-0">
          <div className="print:hidden">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
          </div>
          
          {/* Thermal Receipt Layout */}
          <div className="py-4 space-y-4 text-sm font-mono text-black print:text-xs relative">
            {selectedSale?.status === 'VOIDED' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <span className="text-6xl font-black border-4 border-black p-4 rotate-[-30deg]">VOIDED</span>
              </div>
            )}
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg">{settings.businessName || 'BIZPOS'}</h3>
              <p>{settings.address}</p>
              <p>{settings.contactNumber}</p>
              {settings.tin && <p>TIN: {settings.tin}</p>}
            </div>
            
            <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
              <div className="flex justify-between"><span>Date:</span> <span>{selectedSale && new Date(selectedSale.createdAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Cashier:</span> <span>{selectedSale?.cashSession?.openedBy?.username || 'Unknown'}</span></div>
              <div className="flex justify-between"><span>Payment:</span> <span>{selectedSale?.payment?.method}</span></div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-dashed border-slate-300"><th className="text-left pb-1">Item</th><th className="text-right pb-1">Qty</th><th className="text-right pb-1">Amount</th></tr>
              </thead>
              <tbody>
                {selectedSale?.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-1 pr-2">
                      <div className="line-clamp-1">{item.product?.name || 'Unknown Item'}</div>
                      <div className="text-xs text-slate-500">@{item.unitPrice.toFixed(2)}</div>
                    </td>
                    <td className="text-right align-top py-1">{item.quantity}</td>
                    <td className="text-right align-top py-1">{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 font-bold">
              <div className="flex justify-between text-base">
                <span>TOTAL</span>
                <span>{settings.currency || 'PHP'} {selectedSale?.netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-normal">
                <span>{selectedSale?.payment?.method} RECEIVED</span>
                <span>{selectedSale?.payment?.amountReceived.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-normal">
                <span>CHANGE</span>
                <span>{selectedSale?.payment?.change.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center pt-4 space-y-1">
              <p>{selectedSale?.transactionNo}</p>
              <p className="mt-2 text-xs">{settings.receiptFooter || 'Thank you!'}</p>
            </div>
          </div>

          <div className="print:hidden">
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSale(null)}>Close</Button>
              <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> PRINT RECEIPT</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Void Sale Confirmation Modal */}
      <Dialog open={!!voidSaleTarget} onOpenChange={(open) => !open && setVoidSaleTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertCircle size={20} /> Void Transaction
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVoidSale} className="space-y-4">
            <div className="space-y-2 text-sm text-slate-600">
              <p>Are you sure you want to void transaction <span className="font-mono font-bold text-slate-900">{voidSaleTarget?.transactionNo}</span>?</p>
              <p>This will reverse the inventory deduction and remove the total from today's sales.</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reason for Void</label>
              <Input 
                required 
                value={voidReason} 
                onChange={e => setVoidReason(e.target.value)}
                placeholder="E.g. Customer returned item, Entry error"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setVoidSaleTarget(null)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={isVoiding || voidReason.trim().length < 3}>
                {isVoiding ? 'Voiding...' : 'Confirm Void'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
