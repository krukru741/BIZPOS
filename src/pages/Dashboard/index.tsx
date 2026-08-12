import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [range, setRange] = useState('Today')
  const [kpis, setKpis] = useState({ sales: 0, transactions: 0, itemsSold: 0, grossProfit: 0, lowStock: 0 })
  const [salesTrend, setSalesTrend] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [range])

  const loadData = async () => {
    try {
      const _kpis = await window.ipcRenderer.invoke('dashboard-kpis', range)
      setKpis(_kpis)
      
      const _trend = await window.ipcRenderer.invoke('dashboard-sales-trend', range)
      setSalesTrend(_trend)

      const _top = await window.ipcRenderer.invoke('dashboard-top-products', range)
      setTopProducts(_top)

      const _pay = await window.ipcRenderer.invoke('dashboard-payment-methods', range)
      setPaymentMethods(_pay)

      const _low = await window.ipcRenderer.invoke('dashboard-low-stock')
      setLowStockProducts(_low)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="w-48">
          <Select value={range} onValueChange={(val: any) => setRange(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Yesterday">Yesterday</SelectItem>
              <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
              <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase">Sales Revenue</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">₱{kpis.sales.toFixed(2)}</h2>
              </div>
              <div className="p-3 bg-blue-100 rounded-full text-blue-600"><DollarSign size={20}/></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase">Transactions</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">{kpis.transactions}</h2>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full text-indigo-600"><ShoppingCart size={20}/></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase">Items Sold</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">{kpis.itemsSold}</h2>
              </div>
              <div className="p-3 bg-purple-100 rounded-full text-purple-600"><Package size={20}/></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase">Gross Profit</p>
                <h2 className="text-2xl font-bold text-emerald-600 mt-2">₱{kpis.grossProfit.toFixed(2)}</h2>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600"><TrendingUp size={20}/></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Sales Trend */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₱${val}`} />
                  <Tooltip formatter={(val: any) => [`₱${val.toFixed(2)}`, 'Revenue']} />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Widget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Low Stock</CardTitle>
            <Link to="/inventory">
              <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {lowStockProducts.length === 0 ? (
                <p className="text-slate-500 text-center py-8">All stock levels are optimal.</p>
              ) : lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={p.currentStock === 0 ? "text-red-500" : "text-amber-500"}>
                      {p.currentStock === 0 ? "🔴" : "🟡"}
                    </span>
                    <span className="font-medium line-clamp-1">{p.name}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-700">
                    {p.currentStock} / {p.reorderLevel}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-12 text-sm font-semibold text-slate-500 border-b pb-2">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Qty Sold</div>
                <div className="col-span-2 text-right">Sales</div>
                <div className="col-span-2 text-right">Profit</div>
              </div>
              {topProducts.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No sales data for this period.</p>
              ) : topProducts.map((p, i) => (
                <div key={i} className="grid grid-cols-12 text-sm py-2 items-center border-b last:border-0">
                  <div className="col-span-6 font-medium line-clamp-1 pr-4">{i+1}. {p.name}</div>
                  <div className="col-span-2 text-center">{p.qty}</div>
                  <div className="col-span-2 text-right font-bold">₱{p.sales.toFixed(2)}</div>
                  <div className="col-span-2 text-right text-emerald-600 font-bold">₱{p.profit.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethods} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} />
                  <Tooltip formatter={(val: any) => [`₱${val.toFixed(2)}`, 'Amount']} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {paymentMethods.map(m => (
                <div key={m.name} className="flex justify-between text-sm">
                  <span className="font-medium text-slate-600">{m.name}</span>
                  <span className="font-bold">₱{m.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
