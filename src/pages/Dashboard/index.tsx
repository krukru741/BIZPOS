import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, ShoppingCart, DollarSign, Package, CheckCircle, Wallet, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [range, setRange] = useState('Today')
  const [kpis, setKpis] = useState({ sales: 0, transactions: 0, itemsSold: 0, grossProfit: 0, lowStock: 0 })
  const [salesTrend, setSalesTrend] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [activeSession, setActiveSession] = useState<any>(null)

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

      const _session = await window.ipcRenderer.invoke('cash-active-session')
      setActiveSession(_session)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <div className="w-48">
          <Select value={range} onValueChange={(val: any) => setRange(val)}>
            <SelectTrigger className="h-9">
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

      {/* Cash Session Status Banner */}
      {activeSession ? (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 px-4 rounded-xl mb-2 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <p className="text-sm font-semibold text-emerald-800">Cash Session Open</p>
          </div>
          <p className="text-xs font-bold text-emerald-700">Opening Cash: ₱{activeSession.openingCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-100 p-3 px-4 rounded-xl mb-2 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
            <p className="text-sm font-semibold text-amber-800">Cash Session Not Open</p>
          </div>
          <Button size="sm" onClick={() => navigate('/cash')} className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-4">
            Open Cash Session
          </Button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg border-0 overflow-hidden relative hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <DollarSign size={100} className="-mr-6 -mt-6" />
          </div>
          <CardContent className="p-4 relative z-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                  <DollarSign size={16} className="text-white" />
                </div>
                <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">Sales Revenue</p>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">₱{kpis.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <ShoppingCart size={16} className="text-blue-600" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transactions</p>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{kpis.transactions.toLocaleString()}</h2>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <Package size={16} className="text-indigo-600" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Items Sold</p>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{kpis.itemsSold.toLocaleString()}</h2>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                  <TrendingUp size={16} className="text-emerald-600" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gross Profit</p>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-emerald-600">₱{kpis.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend */}
        <Card className="col-span-1 lg:col-span-2 rounded-2xl shadow-sm border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-bold text-slate-800">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {salesTrend.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <TrendingUp size={28} className="mb-2 text-slate-300" />
                <p className="font-semibold text-sm text-slate-500">No sales yet for this period</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Complete your first transaction to see your sales trend.</p>
                <Button size="sm" onClick={() => navigate('/pos')} className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 gap-2">
                  Go to POS <ArrowRight size={14} />
                </Button>
              </div>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₱${val}`} tick={{ fill: '#94a3b8', fontSize: 10 }} dx={-10} />
                    <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`₱${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']} />
                    <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5, fill: '#0f172a', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Widget */}
        <Card className="rounded-2xl shadow-sm border-slate-100 flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
            <CardTitle className="text-sm font-bold text-slate-800">Low Stock</CardTitle>
            <Link to="/inventory">
              <Button variant="ghost" size="sm" className="text-blue-600 font-semibold hover:bg-blue-50 h-6 text-[10px] -mr-2">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-6 text-slate-500 bg-emerald-50/30 rounded-xl border border-dashed border-emerald-100 h-52 flex flex-col items-center justify-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                    <CheckCircle size={16} />
                  </div>
                  <p className="font-semibold text-emerald-700 text-xs">All optimal</p>
                  <p className="text-[10px] text-emerald-600/70">Stock levels are good.</p>
                </div>
              ) : lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${p.currentStock === 0 ? "bg-red-500" : "bg-amber-400"}`}></div>
                    <span className="font-semibold text-xs text-slate-700 line-clamp-1">{p.name}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">
                    {p.currentStock} / {p.reorderLevel}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Selling Products */}
        <Card className="col-span-1 lg:col-span-2 rounded-2xl shadow-sm border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-bold text-slate-800">Top Selling</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-1">
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 px-2">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Sales</div>
                <div className="col-span-2 text-right">Profit</div>
              </div>
              {topProducts.length === 0 ? (
                <div className="text-center py-6 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Package size={20} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-xs">No sales data for this period.</p>
                </div>
              ) : topProducts.map((p, i) => (
                <div key={i} className="grid grid-cols-12 text-xs py-1.5 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded px-2">
                  <div className="col-span-6 font-semibold text-slate-700 line-clamp-1 pr-2 flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] w-3">{i+1}.</span>
                    {p.name}
                  </div>
                  <div className="col-span-2 text-center font-medium text-slate-600 text-[10px]">{p.qty}</div>
                  <div className="col-span-2 text-right font-bold text-slate-900 text-[10px]">₱{p.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="col-span-2 text-right text-emerald-600 font-bold text-[10px]">₱{p.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Visual Rows */}
        <Card className="rounded-2xl shadow-sm border-slate-100 flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-bold text-slate-800">Payments</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center p-4">
            {paymentMethods.length === 0 ? (
               <div className="text-center py-6 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                 <p className="font-medium text-xs">No payment data.</p>
               </div>
            ) : (
              <div className="space-y-4 mt-2">
                {paymentMethods.map(m => {
                  const totalPayments = paymentMethods.reduce((sum, item) => sum + item.value, 0)
                  const percentage = totalPayments > 0 ? (m.value / totalPayments) * 100 : 0
                  
                  return (
                    <div key={m.name} className="space-y-1.5 group">
                      <div className="flex justify-between items-end text-xs">
                        <span className="font-bold text-slate-600 tracking-wide group-hover:text-blue-600 transition-colors">{m.name}</span>
                        <div className="text-right flex items-center gap-2">
                          <span className="font-bold text-slate-900">₱{m.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-[10px] text-slate-400 font-medium w-8">({percentage.toFixed(0)}%)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-800 rounded-full transition-all duration-1000 ease-out group-hover:bg-blue-600" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
