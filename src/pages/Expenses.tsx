import { useState } from "react";
import { Plus, TrendingDown } from "lucide-react";
import { expenses } from "../data/mockData";

export default function Expenses() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: "", description: "", amount: "", date: "", paid: "cash" });

  const total = expenses.reduce((a, e) => a + e.amount, 0);
  const byCategory = expenses.reduce((a: Record<string, number>, e) => ({ ...a, [e.category]: (a[e.category] || 0) + e.amount }), {});
  const categories = ["Rent", "Staff", "Utilities", "Marketing", "Maintenance", "Packaging", "Transport", "Other"];
  const colors = ["#22C55E", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#F97316", "#6B7280"];

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div className="section-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>Total this month: <strong style={{ color: "var(--danger)" }}>₱{total.toLocaleString("en-IN")}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Log Expense</button>
      </div>

      {/* Category cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {Object.entries(byCategory).map(([cat, amt], i) => (
          <div key={cat} className="metric-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, background: colors[i % colors.length] + "18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingDown size={18} color={colors[i % colors.length]} />
              </div>
              <span className="badge badge-orange">{cat}</span>
            </div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--danger)" }}>₱{amt.toLocaleString("en-IN")}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted-foreground)" }}>{Math.round(amt / total * 100)}% of total</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Paid Via</th></tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{e.date}</td>
                <td><span className="badge badge-orange">{e.category}</span></td>
                <td style={{ fontWeight: 500 }}>{e.description}</td>
                <td style={{ fontWeight: 700, color: "var(--danger)" }}>₱{e.amount.toLocaleString("en-IN")}</td>
                <td><span className={`badge ${e.paid === "cash" ? "badge-green" : "badge-blue"}`}>{e.paid === "cash" ? "Cash" : "Bank"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Log Expense</h3>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label className="form-label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Select category</option>{categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="form-label">Description</label>
                <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What was this expense for?" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label className="form-label">Amount (₱)</label>
                  <input className="input" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
                </div>
                <div><label className="form-label">Date</label>
                  <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div><label className="form-label">Paid via</label>
                <select className="input" value={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.value }))}>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>Save Expense</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
