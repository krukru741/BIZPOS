import { ArrowLeft, Pencil, Trash2, Package, TrendingUp, Barcode } from "lucide-react";
import { products } from "../data/mockData";

interface Props { onNavigate: (p: string) => void; }

export default function ProductDetail({ onNavigate }: Props) {
  const p = products[0];
  const margin = Math.round(((p.sellingPrice - p.buyingPrice) / p.sellingPrice) * 100);

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => onNavigate("products")}><ArrowLeft size={18} /></button>
        <div style={{ flex: 1 }}>
          <h1 className="page-title">{p.name}</h1>
          <p style={{ margin: "2px 0 0", color: "var(--muted-foreground)", fontSize: 13 }}>{p.brand} · {p.category} · SKU: {p.sku}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => onNavigate("add-product")}><Pencil size={15} /> Edit</button>
        <button className="btn btn-danger"><Trash2 size={15} /> Delete</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 24, alignItems: "center", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ width: 120, height: 120, background: "var(--muted)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>{p.image}</div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, textAlign: "center" }}>{p.name}</h2>
            <span className={`badge ${p.stock === 0 ? "badge-red" : p.stock <= p.minStock ? "badge-yellow" : "badge-green"}`}>
              {p.stock === 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "In Stock"}
            </span>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-foreground)" }}>Pricing</h3>
            {[["Selling Price", `₹${p.sellingPrice}`], ["Buying Price", `₹${p.buyingPrice}`], ["GST", `${p.gst}%`], ["Margin", `${margin}%`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                <span style={{ color: "var(--muted-foreground)" }}>{k}</span>
                <span style={{ fontWeight: 700, color: k === "Margin" ? "var(--primary)" : "var(--foreground)" }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-foreground)" }}>Barcode</h3>
            <div style={{ background: "var(--muted)", borderRadius: 10, padding: "16px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 1, marginBottom: 8 }}>
                {p.barcode.split("").map((_, i) => <div key={i} style={{ width: 2 + (i % 3 === 0 ? 2 : 0), height: 40, background: "var(--foreground)", borderRadius: 1 }} />)}
              </div>
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: 13, fontWeight: 600, letterSpacing: "0.2em" }}>{p.barcode}</p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Inventory stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Current Stock", value: `${p.stock} ${p.unit}`, color: p.stock === 0 ? "#EF4444" : p.stock <= p.minStock ? "#F59E0B" : "#22C55E" },
              { label: "Min Stock Alert", value: `${p.minStock} ${p.unit}`, color: "#3B82F6" },
              { label: "Unit", value: p.unit, color: "#8B5CF6" },
            ].map(({ label, value, color }) => (
              <div key={label} className="metric-card">
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Stock history */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Stock History</h3>
            </div>
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Qty</th><th>Reason</th><th>By</th></tr></thead>
              <tbody>
                {[
                  { date: "15 Jan 2024", type: "purchase", qty: "+50", reason: "Purchase Order #142", by: "Admin" },
                  { date: "14 Jan 2024", type: "sale", qty: "-8", reason: "POS Sales", by: "Cashier" },
                  { date: "12 Jan 2024", type: "adjustment", qty: "-2", reason: "Damaged", by: "Admin" },
                  { date: "10 Jan 2024", type: "purchase", qty: "+100", reason: "Purchase Order #138", by: "Admin" },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13 }}>{row.date}</td>
                    <td><span className={`badge ${row.type === "purchase" ? "badge-green" : row.type === "sale" ? "badge-blue" : "badge-orange"}`}>{row.type}</span></td>
                    <td style={{ fontWeight: 700, color: row.qty.startsWith("+") ? "#22C55E" : "#EF4444" }}>{row.qty}</td>
                    <td style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{row.reason}</td>
                    <td style={{ fontSize: 13 }}>{row.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent sales */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Recent Sales</h3>
            </div>
            <table>
              <thead><tr><th>Invoice</th><th>Date</th><th>Qty</th><th>Revenue</th></tr></thead>
              <tbody>
                {[
                  { inv: "INV-2024-0842", date: "15 Jan 2024", qty: 2, rev: 110 },
                  { inv: "INV-2024-0838", date: "15 Jan 2024", qty: 3, rev: 165 },
                  { inv: "INV-2024-0831", date: "14 Jan 2024", qty: 1, rev: 55 },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>{row.inv}</td>
                    <td style={{ fontSize: 13 }}>{row.date}</td>
                    <td style={{ fontWeight: 600 }}>{row.qty}</td>
                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>₹{row.rev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
