import { TrendingUp, TrendingDown, ShoppingBag, Banknote, QrCode, Package, AlertTriangle, XCircle, Plus, ShoppingCart, Truck, DollarSign, ArrowRight } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { dailySalesData, monthlyRevenueData, paymentSplitData, topProducts, salesHistory } from "../data/mockData";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const fmt = (n: number) => "₱" + n.toLocaleString("en-IN");

interface MetricCardProps {
  title: string;
  value: string;
  sub: string;
  trend?: number;
  icon: React.ReactNode;
  accent: string;
}

function MetricCard({ title, value, sub, trend, icon, accent }: MetricCardProps) {
  return (
    <div className="metric-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
          <h3 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: "var(--foreground)" }}>{value}</h3>
        </div>
        <div style={{ width: 44, height: 44, background: accent + "18", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ color: accent }}>{icon}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {trend !== undefined && (
          <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 600, color: trend >= 0 ? "#22C55E" : "#EF4444" }}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{sub}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 13 }}>
        <p style={{ margin: "0 0 6px", fontWeight: 700 }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ margin: "2px 0", color: p.color }}>{p.name}: {p.name.includes("Revenue") || p.name.includes("Profit") || p.name.includes("Sales") ? "₱" : ""}{p.value.toLocaleString("en-IN")}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }} className="animate-fadeIn">
      {/* Greeting */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Good morning, Admin 👋</h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>Tuesday, 15 January 2024 · FreshMart Main Branch</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => onNavigate("purchases")} style={{ fontSize: 13 }}><Truck size={15} />New Purchase</button>
          <button className="btn btn-primary" onClick={() => onNavigate("pos")} style={{ fontSize: 13 }}><ShoppingCart size={15} />New Sale</button>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        <MetricCard title="Today's Sales" value="₱38,420" sub="vs ₱34,200 yesterday" trend={12.3} icon={<TrendingUp size={22} />} accent="#22C55E" />
        <MetricCard title="Today's Orders" value="178" sub="vs 162 yesterday" trend={9.9} icon={<ShoppingBag size={22} />} accent="#3B82F6" />
        <MetricCard title="Cash Collection" value="₱17,289" sub="45% of total" icon={<Banknote size={22} />} accent="#F59E0B" />
        <MetricCard title="QR / UPI" value="₱14,599" sub="38% of total" icon={<QrCode size={22} />} accent="#8B5CF6" />
        <MetricCard title="Monthly Revenue" value="₱3,56,000" sub="Jan 2024" trend={7.4} icon={<TrendingUp size={22} />} accent="#22C55E" />
        <MetricCard title="Profit" value="₱85,440" sub="24% margin" trend={4.1} icon={<DollarSign size={22} />} accent="#84CC16" />
        <MetricCard title="Inventory Value" value="₱2,84,320" sub="1,247 SKUs active" icon={<Package size={22} />} accent="#06B6D4" />
        <MetricCard title="Low Stock" value="5 items" sub="Need restock" icon={<AlertTriangle size={22} />} accent="#F59E0B" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Sales chart */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-header">
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Weekly Sales</h3>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>Daily revenue this week</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailySalesData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => "₱" + (v / 1000) + "k"} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sales" name="Sales" stroke="#22C55E" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ fill: "#22C55E", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment split */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-header">
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Payment Split</h3>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>This month</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={paymentSplitData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {paymentSplitData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {paymentSplitData.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color }} />
                  <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue chart + Top products */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="section-header">
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Revenue vs Profit</h3>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>Last 7 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => "₱" + (v / 1000) + "k"} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill="#84CC16" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="section-header">
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Top Products</h3>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => onNavigate("products")}>View all <ArrowRight size={13} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topProducts.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 28, height: 28, background: "var(--muted)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "var(--muted-foreground)", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--muted-foreground)" }}>{p.sold} sold</p>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{fmt(p.revenue)}</p>
                  <span style={{ fontSize: 11, color: p.trend.startsWith("+") ? "#22C55E" : "#EF4444", fontWeight: 600 }}>{p.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions + Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Recent Transactions</h3>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => onNavigate("sales")}>View all <ArrowRight size={13} /></button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {salesHistory.slice(0, 5).map(s => (
                <tr key={s.id}>
                  <td style={{ fontSize: 13, fontFamily: "monospace", color: "var(--primary)", fontWeight: 600 }}>{s.id}</td>
                  <td style={{ fontSize: 13 }}>{s.customer}</td>
                  <td style={{ fontSize: 13, fontWeight: 700 }}>{fmt(s.total)}</td>
                  <td><span className={`badge ${s.payment === "cash" ? "badge-green" : s.payment === "qr" ? "badge-blue" : "badge-purple"}`}>{s.payment.toUpperCase()}</span></td>
                  <td><span className={`badge ${s.status === "completed" ? "badge-green" : "badge-red"}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "New Sale", icon: ShoppingCart, page: "pos", color: "#22C55E" },
              { label: "Add Product", icon: Plus, page: "add-product", color: "#3B82F6" },
              { label: "Purchase Stock", icon: Truck, page: "purchases", color: "#F59E0B" },
              { label: "Log Expense", icon: DollarSign, page: "expenses", color: "#8B5CF6" },
            ].map(({ label, icon: Icon, page, color }) => (
              <button key={label} className="btn btn-secondary" style={{ justifyContent: "flex-start", padding: "11px 14px", borderRadius: 10 }} onClick={() => onNavigate(page)}>
                <div style={{ width: 32, height: 32, background: color + "18", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
                <ArrowRight size={14} style={{ marginLeft: "auto", color: "var(--muted-foreground)" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
