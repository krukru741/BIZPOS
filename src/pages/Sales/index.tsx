import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Printer } from 'lucide-react'

export default function Sales() {
  const [sales, setSales] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({})
  const [selectedSale, setSelectedSale] = useState<any | null>(null)
  
  useEffect(() => {
    loadSales()
    loadSettings()
  }, [])

  const loadSales = async () => {
    const res = await window.ipcRenderer.invoke('get-sales')
    setSales(res)
  }

  const loadSettings = async () => {
    const res = await window.ipcRenderer.invoke('get-settings')
    setSettings(res)
  }

  const today = new Date().toISOString().slice(0, 10)
  const todaysSales = sales.filter(s => s.createdAt.startsWith(today))
  const totalAmount = todaysSales.reduce((sum, s) => sum + s.netAmount, 0)
  const itemsSold = todaysSales.reduce((sum, s) => sum + s.items.reduce((iSum: number, item: any) => iSum + item.quantity, 0), 0)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      <div className="print:hidden">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Sales History</h1>
        
        {/* Today's Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-500">TODAY'S SALES</p>
              <h2 className="text-3xl font-bold text-blue-600">₱{totalAmount.toFixed(2)}</h2>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-500">TRANSACTIONS</p>
              <h2 className="text-3xl font-bold">{todaysSales.length}</h2>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-slate-500">ITEMS SOLD</p>
              <h2 className="text-3xl font-bold">{itemsSold}</h2>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction No.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">No transactions found.</TableCell></TableRow>
                ) : sales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-mono font-medium">{sale.transactionNo}</TableCell>
                    <TableCell>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{sale.status}</span>
                    </TableCell>
                    <TableCell className="font-bold">₱{sale.netAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedSale(sale)}>View / Print</Button>
                    </TableCell>
                  </TableRow>
                ))}
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
          <div className="py-4 space-y-4 text-sm font-mono text-black print:text-xs">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg">{settings.businessName || 'BIZPOS'}</h3>
              <p>{settings.address}</p>
              <p>{settings.contactNumber}</p>
              {settings.tin && <p>TIN: {settings.tin}</p>}
            </div>
            
            <div className="border-t border-b border-dashed py-2 space-y-1">
              <div className="flex justify-between"><span>Date:</span> <span>{selectedSale && new Date(selectedSale.createdAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Cashier:</span> <span>Juan (Admin)</span></div>
              <div className="flex justify-between"><span>Payment:</span> <span>{selectedSale?.payment?.method}</span></div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-dashed"><th className="text-left pb-1">Item</th><th className="text-right pb-1">Qty</th><th className="text-right pb-1">Amount</th></tr>
              </thead>
              <tbody>
                {selectedSale?.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-1">
                      <div className="line-clamp-1">{item.product.name}</div>
                      <div className="text-xs text-slate-500">@{item.unitPrice.toFixed(2)}</div>
                    </td>
                    <td className="text-right align-top py-1">{item.quantity}</td>
                    <td className="text-right align-top py-1">{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed pt-2 space-y-1 font-bold">
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
    </div>
  )
}
