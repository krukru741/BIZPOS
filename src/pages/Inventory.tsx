import { useState } from "react";
import { Package, AlertTriangle, XCircle, Search, Plus, Minus, TrendingUp } from "lucide-react";
import { products } from "../data/mockData";

interface InventoryProps { onNavigate: (p: string) => void; }

export default function Inventory({ onNavigate }: InventoryProps) {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [adjType, setAdjType] = useState<"increase" | "reduce">("increase");
  const [adjQty, setAdjQty] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [search, setSearch] = useState("");

  const inStock = products.filter(p => p.stock > p.minStock).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((a, p) => a + p.stock * p.buyingPrice, 0);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div className="section-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>Track and manage stock levels</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Inventory Value", value: `₱${totalValue.toLocaleString("en-IN")}`, sub: "at buying price", color: "#22C55E", icon: <Package size={20} /> },
          { label: "In Stock", value: inStock, sub: "products", color: "#3B82F6", icon: <TrendingUp size={20} /> },
          { label: "Low Stock", value: lowStock, sub: "need reorder", color: "#F59E0B", icon: <AlertTriangle size={20} /> },
          { label: "Out of Stock", value: outOfStock, sub: "urgent", color: "#EF4444", icon: <XCircle size={20} /> },
        ].map(({ label, value, sub, color, icon }) => (
          <div key={label} className="metric-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                <h3 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color }}>{value}</h3>
              </div>
              <div style={{ width: 40, height: 40, background: color + "18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color }}>{icon}</div>
              </div>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
        <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
        <input className="input" style={{ paddingLeft: 34 }} placeholder="Search inventory…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Min Stock</th>
              <th>Value</th>
              <th>Status</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{p.image}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "var(--muted-foreground)" }}>{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted-foreground)" }}>{p.sku}</td>
                <td><span className="badge badge-blue">{p.category}</span></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 60, height: 6, background: "var(--muted)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, (p.stock / (p.minStock * 3)) * 100)}%`, height: "100%", background: p.stock === 0 ? "#EF4444" : p.stock <= p.minStock ? "#F59E0B" : "#22C55E", borderRadius: 3, transition: "width 0.3s ease" }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{p.stock}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13 }}>{p.minStock} {p.unit}</td>
                <td style={{ fontWeight: 700, fontSize: 13 }}>₱{(p.stock * p.buyingPrice).toLocaleString("en-IN")}</td>
                <td>
                  {p.stock === 0 ? <span className="badge badge-red">Out of Stock</span> :
                   p.stock <= p.minStock ? <span className="badge badge-yellow">Low Stock</span> :
                   <span className="badge badge-green">In Stock</span>}
                </td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setSelectedProduct(p)}>
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjustment Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>Stock Adjustment</h3>
            <p style={{ margin: "0 0 20px", color: "var(--muted-foreground)", fontSize: 14 }}>{selectedProduct.name}</p>

            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--muted)", borderRadius: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 32 }}>{selectedProduct.image}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700 }}>{selectedProduct.name}</p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>Current stock: <strong style={{ color: "var(--foreground)" }}>{selectedProduct.stock} {selectedProduct.unit}</strong></p>
              </div>
            </div>

            <div className="tab-bar" style={{ marginBottom: 20 }}>
              <button className={`tab-item ${adjType === "increase" ? "active" : ""}`} onClick={() => setAdjType("increase")}>
                <Plus size={14} style={{ display: "inline", marginRight: 4 }} />Increase
              </button>
              <button className={`tab-item ${adjType === "reduce" ? "active" : ""}`} onClick={() => setAdjType("reduce")}>
                <Minus size={14} style={{ display: "inline", marginRight: 4 }} />Reduce
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Quantity *</label>
                <input className="input" type="number" value={adjQty} onChange={e => setAdjQty(e.target.value)} placeholder="0" />
                {adjQty && (
                  <p style={{ margin: "5px 0 0", fontSize: 12, color: adjType === "increase" ? "#22C55E" : "#EF4444" }}>
                    New stock will be: <strong>{adjType === "increase" ? selectedProduct.stock + +adjQty : selectedProduct.stock - +adjQty} {selectedProduct.unit}</strong>
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">Reason</label>
                <select className="input" value={adjReason} onChange={e => setAdjReason(e.target.value)}>
                  <option value="">Select reason</option>
                  <option>Purchase received</option>
                  <option>Stock count correction</option>
                  <option>Damaged goods</option>
                  <option>Expired products</option>
                  <option>Supplier return</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Notes (optional)</label>
                <input className="input" placeholder="Additional notes…" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setSelectedProduct(null)}>Save Adjustment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
