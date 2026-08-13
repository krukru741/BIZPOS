import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, ShoppingCart, DollarSign, Package, CheckCircle, Wallet, ArrowRight, Clock, AlertTriangle, ChevronRight, TrendingDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

const TrendBadge = ({ value }: { value: number }) => {
  if (value === 0) return <span className="text-xs text-slate-400 ml-2 font-normal tracking-normal bg-slate-100 px-1.5 py-0.5 rounded">No change</span>
  if (value > 0) return <span className="text-xs text-emerald-400 ml-2 font-bold tracking-normal bg-white/10 px-1.5 py-0.5 rounded">+{value.toFixed(1)}%</span>
  return <span className="text-xs text-rose-400 ml-2 font-bold tracking-normal bg-white/10 px-1.5 py-0.5 rounded">{value.toFixed(1)}%</span>
}

const TrendBadgeLight = ({ value }: { value: number }) => {
  if (value === 0) return <span className="text-xs text-slate-400 ml-2 font-normal tracking-normal bg-slate-100 px-1.5 py-0.5 rounded">No change</span>
  if (value > 0) return <span className="text-xs text-emerald-600 ml-2 font-bold tracking-normal bg-emerald-50 px-1.5 py-0.5 rounded">+{value.toFixed(1)}%</span>
  return <span className="text-xs text-rose-600 ml-2 font-bold tracking-normal bg-rose-50 px-1.5 py-0.5 rounded">{value.toFixed(1)}%</span>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [range, setRange] = useState('Today')
  const [kpis, setKpis] = useState({ 
    sales: 0, salesTrend: 0, 
    transactions: 0, transactionsTrend: 0, 
    itemsSold: 0, itemsSoldTrend: 0, 
    grossProfit: 0, grossProfitTrend: 0, margin: 0 
  })
  const [salesTrend, setSalesTrend] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [inventoryAlerts, setInventoryAlerts] = useState<any>({ outOfStock: [], lowStock: [], nearExpiry: [] })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
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

      const _alerts = await window.ipcRenderer.invoke('dashboard-inventory-alerts')
      setInventoryAlerts(_alerts)

      const _recent = await window.ipcRenderer.invoke('dashboard-recent-activity')
      setRecentActivity(_recent)

      const _session = await window.ipcRenderer.invoke('cash-active-session')
      setActiveSession(_session)
    } catch (err) {
      console.error(err)
    }
  }

  const PIE_COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b']

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/pos')} className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm"><ShoppingCart size={14} /> New Sale</Button>
          <Button variant="outline" onClick={() => navigate('/products')} className="h-9 gap-2"><Package size={14} /> Add Product</Button>
          <div className="w-40 ml-2">
            <Select value={range} onValueChange={(val: any) => setRange(val)}>
              <SelectTrigger className="h-9 bg-white">
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
          <Button size="sm" onClick={() => navigate('/cash')} className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 shadow-sm">
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
                <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">Revenue</p>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">₱{kpis.sales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                <div className="mt-1"><TrendBadge value={kpis.salesTrend} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
            <ShoppingCart size={80} className="-mr-4 -mt-4 text-blue-600" />
          </div>
          <CardContent className="p-4 relative z-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <ShoppingCart size={16} className="text-blue-600" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transactions</p>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{kpis.transactions.toLocaleString()}</h2>
                <div className="mt-1"><TrendBadgeLight value={kpis.transactionsTrend} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
            <Package size={80} className="-mr-4 -mt-4 text-indigo-600" />
          </div>
          <CardContent className="p-4 relative z-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <Package size={16} className="text-indigo-600" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Items Sold</p>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{kpis.itemsSold.toLocaleString()}</h2>
                <div className="mt-1"><TrendBadgeLight value={kpis.itemsSoldTrend} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
            <TrendingUp size={80} className="-mr-4 -mt-4 text-emerald-600" />
          </div>
          <CardContent className="p-4 relative z-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 rounded-lg">
                    <TrendingUp size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gross Profit</p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{kpis.margin.toFixed(1)}% Margin</span>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-emerald-600">₱{kpis.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                <div className="mt-1"><TrendBadgeLight value={kpis.grossProfitTrend} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend (Area Chart) */}
        <Card className="col-span-1 lg:col-span-2 rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-bold text-slate-800">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            {salesTrend.reduce((sum, item) => sum + item.total, 0) === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <TrendingUp size={28} className="mb-2 text-slate-300" />
                <p className="font-semibold text-sm text-slate-500">No sales yet for this period</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Complete your first transaction to see your sales trend.</p>
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₱${val}`} tick={{ fill: '#94a3b8', fontSize: 10 }} dx={-10} width={60} />
                    <Tooltip 
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      formatter={(val: any) => [`₱${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']} 
                    />
                    <Area type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" activeDot={{ r: 5, fill: '#0f172a', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments Donut Chart */}
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-bold text-slate-800">Revenue by Payment</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col items-center justify-center relative">
            {paymentMethods.reduce((sum, item) => sum + item.value, 0) === 0 ? (
              <div className="w-full h-full min-h-[220px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400 font-semibold">No data</p>
              </div>
            ) : (
              <>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentMethods.filter(m => m.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                        {paymentMethods.filter(m => m.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => `₱${val.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                  {paymentMethods.filter(m => m.value > 0).map((m, i) => (
                    <div key={m.name} className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded-md">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500">{m.name}</span>
                        <span className="text-xs font-semibold">₱{m.value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Selling Mini Table */}
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-800">Top 5 Products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topProducts.length === 0 ? (
               <div className="p-6 text-center text-sm text-slate-400">No data available</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-extrabold">{i + 1}</div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{p.qty} items sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-slate-900">₱{p.sales.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Feed / Recent Activity */}
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2"><Clock size={16} className="text-slate-400" /> Recent Sales</CardTitle>
            <Link to="/sales">
              <Button variant="ghost" size="sm" className="text-blue-600 font-semibold hover:bg-blue-50 h-6 text-[10px] -mr-2">View Log</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            {recentActivity.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-slate-400 text-sm py-4">No recent sales</div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map(a => (
                  <div key={a.id} className="flex gap-3 text-sm">
                     <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div></div>
                     <div className="flex-1">
                       <div className="flex justify-between">
                         <p className="font-bold text-slate-800">₱{a.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                         <p className="text-[10px] font-medium text-slate-400">{format(new Date(a.time), 'hh:mm a')}</p>
                       </div>
                       <p className="text-[10px] text-slate-500">#{a.transactionNo} • {a.cashier}</p>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2"><AlertTriangle size={16} className="text-slate-400" /> Inventory Alerts</CardTitle>
            <Link to="/products">
              <Button variant="ghost" size="sm" className="text-blue-600 font-semibold hover:bg-blue-50 h-6 text-[10px] -mr-2">Manage</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto max-h-[300px]">
            {(!inventoryAlerts.outOfStock?.length && !inventoryAlerts.lowStock?.length && !inventoryAlerts.nearExpiry?.length) ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
                  <CheckCircle size={20} />
                </div>
                <p className="text-sm font-bold text-emerald-700">All Optimal</p>
                <p className="text-xs text-slate-400 mt-1">No inventory warnings detected.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {/* Out of Stock */}
                {inventoryAlerts.outOfStock?.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-3 hover:bg-slate-50">
                    <div>
                      <p className="font-semibold text-sm text-slate-800 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.barcode || 'No barcode'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-700">Out of Stock</span>
                  </div>
                ))}
                
                {/* Low Stock */}
                {inventoryAlerts.lowStock?.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-3 hover:bg-slate-50">
                    <div>
                      <p className="font-semibold text-sm text-slate-800 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.currentStock} remaining</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700">Low Stock</span>
                  </div>
                ))}

                {/* Near Expiry */}
                {inventoryAlerts.nearExpiry?.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-3 hover:bg-slate-50">
                    <div>
                      <p className="font-semibold text-sm text-slate-800 line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-slate-500">Exp: {format(new Date(p.expiryDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-700">Near Expiry</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
