import { useState } from "react";
import { Download, TrendingUp, TrendingDown, FileText, Table } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { dailySalesData, monthlyRevenueData, topProducts } from "../data/mockData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
      <p style={{ margin: "0 0 6px", fontWeight: 700 }}>{label}</p>
      {payload.map((p: any, i: number) => <p key={i} style={{ margin: "2px 0", color: p.color }}>{p.name}: ₱{p.value?.toLocaleString("en-PH")}</p>)}
    </div>
  );
};

export default function Reports() {
  const [period, setPeriod] = useState("monthly");

  const kpis = [
    { label: "Total Revenue", value: "₱3,56,000", change: "+7.4%", up: true },
    { label: "Total Profit", value: "₱85,440", change: "+4.1%", up: true },
    { label: "Total Orders", value: "1,247", change: "+12.3%", up: true },
    { label: "Avg Order Value", value: "₱285", change: "-2.1%", up: false },
    { label: "Inventory Turnover", value: "4.2x", change: "+0.8x", up: true },
    { label: "Gross Margin", value: "24%", change: "+1.2%", up: true },
  ];

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div className="section-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>Business analytics and insights</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary"><Table size={15} /> Export Excel</button>
          <button className="btn btn-primary"><FileText size={15} /> Export PDF</button>
        </div>
      </div>

      {/* Period tabs */}
      <div className="tab-bar" style={{ maxWidth: 400, marginBottom: 24 }}>
        {["daily", "weekly", "monthly"].map(p => (
          <button key={p} className={`tab-item ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)} style={{ textTransform: "capitalize" }}>{p}</button>
        ))}
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {kpis.map(({ label, value, change, up }) => (
          <div key={label} className="metric-card">
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            <h3 style={{ margin: "4px 0 4px", fontSize: 22, fontWeight: 800 }}>{value}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: up ? "#22C55E" : "#EF4444" }}>
              {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {change} vs last period
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Revenue & Profit</h3>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>Monthly breakdown</p>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12 }}><Download size={14} /> PNG</button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyRevenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.12} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84CC16" stopOpacity={0.15} /><stop offset="95%" stopColor="#84CC16" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => "₱" + v / 1000 + "k"} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22C55E" strokeWidth={2.5} fill="url(#rev)" />
              <Area type="monotone" dataKey="profit" name="Profit" stroke="#84CC16" strokeWidth={2.5} fill="url(#pro)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Top Products</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--muted-foreground)" }}>By revenue this month</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {topProducts.map((p, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>₱{(p.revenue / 1000).toFixed(1)}k</span>
                </div>
                <div style={{ height: 6, background: "var(--muted)", borderRadius: 3 }}>
                  <div style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%`, height: "100%", background: ["#22C55E","#3B82F6","#F59E0B","#8B5CF6","#EF4444"][i], borderRadius: 3, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily sales + inventory */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Daily Orders</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="orders" name="Orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Inventory Report</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--muted-foreground)" }}>Current stock health</p>
          {[
            { label: "In Stock", count: 9, pct: 75, color: "#22C55E" },
            { label: "Low Stock", count: 2, pct: 17, color: "#F59E0B" },
            { label: "Out of Stock", count: 1, pct: 8, color: "#EF4444" },
          ].map(({ label, count, pct, color }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{count} products ({pct}%)</span>
              </div>
              <div style={{ height: 8, background: "var(--muted)", borderRadius: 4 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
