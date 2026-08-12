import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Download, Printer } from 'lucide-react'

export default function Reports() {
  const [range, setRange] = useState('This Month')
  const [reportType, setReportType] = useState('PROFIT')
  const [data, setData] = useState<any>(null)
  
  useEffect(() => {
    loadReport()
  }, [range, reportType])

  const loadReport = async () => {
    try {
      const res = await window.ipcRenderer.invoke('dashboard-report', reportType, range)
      setData(res)
    } catch (err) {
      console.error(err)
    }
  }

  const exportCSV = () => {
    if (!data) return
    let csv = ''
    if (reportType === 'PROFIT') {
      csv = `Revenue,COGS,Gross Profit,Margin\n${data.revenue},${data.cogs},${data.grossProfit},${data.margin}%`
    } else if (reportType === 'INVENTORY') {
      csv = `Total Products,Total Cost,Potential Sales,Potential Profit,Low Stock,Out of Stock\n${data.totalProducts},${data.totalCost},${data.potentialSales},${data.potentialProfit},${data.lowStock},${data.outOfStock}`
    } else if (reportType === 'SALES_BY_DATE') {
      csv = `Date,Transactions,Sales\n`
      data.forEach((row: any) => { csv += `${row.date},${row.tx},${row.amount}\n` })
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BizPOS_${reportType}_${range}.csv`
    a.click()
  }

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <div className="flex gap-4">
          <Select value={reportType} onValueChange={(val: any) => setReportType(val)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Report Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PROFIT">Profit Report</SelectItem>
              <SelectItem value="INVENTORY">Inventory Report</SelectItem>
              <SelectItem value="SALES_BY_DATE">Sales by Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={range} onValueChange={(val: any) => setRange(val)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Date Range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Yesterday">Yesterday</SelectItem>
              <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
              <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
          <Button onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" /> Print PDF</Button>
        </div>
      </div>

      <div className="print:block p-8 bg-white text-black min-h-screen">
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold uppercase">BIZPOS - {reportType.replace(/_/g, ' ')} REPORT</h1>
          <p className="text-sm">Period: {range}</p>
          <p className="text-sm text-slate-500">Printed on {new Date().toLocaleString()}</p>
        </div>

        {reportType === 'PROFIT' && data && (
          <Card className="print:shadow-none print:border-none">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-lg"><span className="text-slate-500">Sales Revenue</span> <span className="font-bold">₱{data.revenue.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg"><span className="text-slate-500">Cost of Goods Sold</span> <span className="font-bold">₱{data.cogs.toFixed(2)}</span></div>
              <div className="border-t my-4 border-slate-200 print:border-black"></div>
              <div className="flex justify-between text-2xl font-bold"><span>Gross Profit</span> <span className="text-emerald-600 print:text-black">₱{data.grossProfit.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg"><span>Gross Margin</span> <span>{data.margin.toFixed(1)}%</span></div>
            </CardContent>
          </Card>
        )}

        {reportType === 'INVENTORY' && data && (
          <Card className="print:shadow-none print:border-none">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between"><span className="text-slate-500">Total Products</span> <span className="font-bold">{data.totalProducts}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Low Stock</span> <span className="font-bold text-amber-500">{data.lowStock}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Out of Stock</span> <span className="font-bold text-red-500">{data.outOfStock}</span></div>
                </div>
                <div className="space-y-4 border-l pl-8 print:border-black">
                  <div className="flex justify-between"><span className="text-slate-500">Total Inventory Cost</span> <span className="font-bold">₱{data.totalCost.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Potential Sales Value</span> <span className="font-bold">₱{data.potentialSales.toFixed(2)}</span></div>
                  <div className="border-t my-2 border-slate-200 print:border-black"></div>
                  <div className="flex justify-between text-lg font-bold"><span>Potential Gross Profit</span> <span className="text-emerald-600 print:text-black">₱{data.potentialProfit.toFixed(2)}</span></div>
                  <p className="text-xs text-slate-400 mt-2">* Potential Gross Profit assumes all current stock sells at its configured selling price.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === 'SALES_BY_DATE' && data && (
          <Card className="print:shadow-none print:border-none">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Transactions</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-8">No data found.</TableCell></TableRow>
                  ) : data.map((row: any) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell className="text-center">{row.tx}</TableCell>
                      <TableCell className="text-right font-bold">₱{row.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50 font-bold print:bg-white">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-center">{data.reduce((sum:number, r:any)=>sum+r.tx,0)}</TableCell>
                    <TableCell className="text-right text-blue-600 print:text-black">₱{data.reduce((sum:number, r:any)=>sum+r.amount,0).toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
