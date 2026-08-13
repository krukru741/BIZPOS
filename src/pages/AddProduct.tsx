import { useState } from "react";
import { Upload, X, Save } from "lucide-react";
import { categories } from "../data/mockData";

interface AddProductProps {
  onNavigate: (page: string) => void;
}

export default function AddProduct({ onNavigate }: AddProductProps) {
  const [form, setForm] = useState({
    name: "", sku: "", barcode: "", category: "", brand: "",
    buyingPrice: "", sellingPrice: "", gst: "5", stock: "", minStock: "", unit: "pcs", description: ""
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>
  );
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="form-label">{label}</label>{children}</div>
  );

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div className="section-header">
        <div>
          <h1 className="page-title">Add Product</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>Fill in product details below</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => onNavigate("products")}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onNavigate("products")}><Save size={15} />Save Product</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
        {/* Main form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Basic Info */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Basic Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Product Name *">
                <input className="input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Organic Whole Milk" />
              </Field>
              <Row>
                <Field label="SKU">
                  <input className="input" value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="MILK-001" />
                </Field>
                <Field label="Barcode">
                  <input className="input" value={form.barcode} onChange={e => set("barcode", e.target.value)} placeholder="8901030784" />
                </Field>
              </Row>
              <Row>
                <Field label="Category">
                  <select className="input" value={form.category} onChange={e => set("category", e.target.value)}>
                    <option value="">Select category</option>
                    {categories.slice(1).map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Brand">
                  <input className="input" value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="Brand name" />
                </Field>
              </Row>
              <Field label="Description">
                <textarea className="input" style={{ minHeight: 80, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Product description (optional)" />
              </Field>
            </div>
          </div>

          {/* Pricing */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Pricing & Tax</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Row>
                <Field label="Buying Price (₹) *">
                  <input className="input" type="number" value={form.buyingPrice} onChange={e => set("buyingPrice", e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Selling Price (₹) *">
                  <input className="input" type="number" value={form.sellingPrice} onChange={e => set("sellingPrice", e.target.value)} placeholder="0.00" />
                </Field>
              </Row>
              <Row>
                <Field label="GST (%)">
                  <select className="input" value={form.gst} onChange={e => set("gst", e.target.value)}>
                    {["0", "5", "12", "18", "28"].map(v => <option key={v} value={v}>{v}%</option>)}
                  </select>
                </Field>
                <div>
                  <label className="form-label">Profit Margin</label>
                  <div style={{ padding: "9px 12px", background: "var(--muted)", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>
                    {form.buyingPrice && form.sellingPrice
                      ? `${Math.round(((+form.sellingPrice - +form.buyingPrice) / +form.sellingPrice) * 100)}%`
                      : "—"}
                  </div>
                </div>
              </Row>
            </div>
          </div>

          {/* Inventory */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Inventory</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Row>
                <Field label="Opening Stock *">
                  <input className="input" type="number" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="0" />
                </Field>
                <Field label="Minimum Stock Alert">
                  <input className="input" type="number" value={form.minStock} onChange={e => set("minStock", e.target.value)} placeholder="5" />
                </Field>
              </Row>
              <Field label="Unit">
                <select className="input" value={form.unit} onChange={e => set("unit", e.target.value)}>
                  {["pcs", "kg", "g", "L", "mL", "box", "doz", "btl", "bag", "pack"].map(u => <option key={u}>{u}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Product Image</h3>
            <div style={{
              border: "2px dashed var(--border)",
              borderRadius: 12,
              padding: "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.15s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
              onMouseOver={e => (e.currentTarget.style.borderColor = "var(--primary)")}
              onMouseOut={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div style={{ width: 56, height: 56, background: "var(--muted)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Upload size={24} color="var(--muted-foreground)" />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Drop image here</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>or click to browse</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted-foreground)" }}>PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div className="card" style={{ padding: 20, background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-foreground)" }}>Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Name", form.name || "—"],
                ["Category", form.category || "—"],
                ["Selling Price", form.sellingPrice ? `₹${form.sellingPrice}` : "—"],
                ["Stock", form.stock ? `${form.stock} ${form.unit}` : "—"],
                ["GST", `${form.gst}%`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--muted-foreground)" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
