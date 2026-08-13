import { useState } from "react";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

interface ManualSaleProps { onNavigate: (p: string) => void; }

export default function ManualSale({ onNavigate }: ManualSaleProps) {
  const [items, setItems] = useState([{ id: 1, name: "", qty: 1, price: "" }]);
  const [customer, setCustomer] = useState("");
  const [payment, setPayment] = useState("cash");
  const [notes, setNotes] = useState("");

  const addItem = () => setItems(i => [...i, { id: Date.now(), name: "", qty: 1, price: "" }]);
  const removeItem = (id: number) => setItems(i => i.filter(x => x.id !== id));
  const updateItem = (id: number, key: string, value: any) => setItems(i => i.map(x => x.id === id ? { ...x, [key]: value } : x));

  const total = items.reduce((a, i) => a + (i.qty * (+i.price || 0)), 0);

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => onNavigate("sales")}><ArrowLeft size={18} /></button>
        <div>
          <h1 className="page-title">Manual Sale</h1>
          <p style={{ margin: "2px 0 0", color: "var(--muted-foreground)", fontSize: 13 }}>Record a sale manually</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Customer */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontWeight: 700 }}>Customer</h3>
            <input className="input" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Customer name or phone (optional)" />
          </div>

          {/* Items */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Items</h3>
              <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={addItem}><Plus size={14} /> Add Item</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px auto", gap: 10, alignItems: "center" }}>
                  <input className="input" placeholder="Item name" value={item.name} onChange={e => updateItem(item.id, "name", e.target.value)} />
                  <input className="input" type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(item.id, "qty", +e.target.value)} />
                  <input className="input" type="number" placeholder="₹ Price" value={item.price} onChange={e => updateItem(item.id, "price", e.target.value)} />
                  <button className="btn btn-ghost" style={{ padding: 8, color: "var(--danger)" }} onClick={() => removeItem(item.id)} disabled={items.length === 1}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontWeight: 700 }}>Payment Method</h3>
            <div style={{ display: "flex", gap: 10 }}>
              {["cash", "qr", "card", "credit"].map(m => (
                <button key={m} onClick={() => setPayment(m)} style={{
                  flex: 1, padding: "10px 8px", border: `2px solid ${payment === m ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 10, background: payment === m ? "rgba(34,197,94,0.08)" : "transparent",
                  cursor: "pointer", fontSize: 13, fontWeight: 600,
                  color: payment === m ? "var(--primary)" : "var(--muted-foreground)",
                  textTransform: "capitalize",
                }}>{m}</button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontWeight: 700 }}>Notes</h3>
            <textarea className="input" style={{ minHeight: 80 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes…" />
          </div>
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: 20, position: "sticky", top: 80 }}>
          <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {items.filter(i => i.name).map(i => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--muted-foreground)" }}>{i.name} × {i.qty}</span>
                <span>₹{(i.qty * (+i.price || 0)).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 12 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 22, color: "var(--primary)" }}>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={() => onNavigate("sales")}>
            Complete Sale
          </button>
          <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => onNavigate("sales")}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
