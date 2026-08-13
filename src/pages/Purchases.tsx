import { useState } from "react";
import { Plus, Eye, Truck } from "lucide-react";
import { purchases } from "../data/mockData";

export default function Purchases() {
  const [showModal, setShowModal] = useState(false);

  const suppliers = ["Metro Cash & Carry", "Reliance Fresh WS", "BigBazaar Wholesale", "Local Dairy Co.", "Agro Supplies Ltd"];

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div className="section-header">
        <div>
          <h1 className="page-title">Purchases</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>Manage supplier orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> New Purchase</button>
      </div>

      {/* Supplier cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {suppliers.map((s, i) => (
          <div key={s} className="card" style={{ padding: 18, cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, background: ["#DCFCE7", "#DBEAFE", "#FFEDD5", "#EDE9FE", "#FEF9C3"][i], borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Truck size={20} color={["#15803D", "#1D4ED8", "#C2410C", "#7C3AED", "#A16207"][i]} />
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{s}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>{1 + i} orders this month</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>{p.id}</td>
                <td style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{p.date}</td>
                <td style={{ fontWeight: 500 }}>{p.supplier}</td>
                <td>{p.items} items</td>
                <td style={{ fontWeight: 700 }}>₹{p.total.toLocaleString("en-IN")}</td>
                <td><span className={`badge ${p.status === "received" ? "badge-green" : "badge-yellow"}`}>{p.status}</span></td>
                <td><button className="btn btn-ghost" style={{ padding: 6 }}><Eye size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Purchase Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>New Purchase Order</h3>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label className="form-label">Supplier</label>
                <select className="input"><option>Select supplier</option>{suppliers.map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label className="form-label">Purchase Date</label><input className="input" type="date" defaultValue="2024-01-15" /></div>
              <div><label className="form-label">Expected Delivery</label><input className="input" type="date" defaultValue="2024-01-20" /></div>
              <div><label className="form-label">Notes</label><textarea className="input" style={{ minHeight: 70 }} placeholder="Purchase notes…" /></div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>Create PO</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
