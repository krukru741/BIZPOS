import { useState } from "react";
import { Search, Eye, Printer, RotateCcw, Filter } from "lucide-react";
import { salesHistory } from "../data/mockData";

interface SalesProps { onNavigate: (p: string) => void; }

export default function Sales({ onNavigate }: SalesProps) {
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [selectedInvoice, setSelectedInvoice] = useState<typeof salesHistory[0] | null>(null);

  const filtered = salesHistory.filter(s => {
    const matchSearch = s.id.toLowerCase().includes(search.toLowerCase()) || s.customer.toLowerCase().includes(search.toLowerCase());
    const matchPay = payFilter === "all" || s.payment === payFilter;
    return matchSearch && matchPay;
  });

  const totalRevenue = filtered.filter(s => s.status === "completed").reduce((a, s) => a + s.total, 0);

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div className="section-header">
        <div>
          <h1 className="page-title">Sales History</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>{filtered.length} transactions · ₱{totalRevenue.toLocaleString("en-IN")} revenue</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("manual-sale")}>+ Manual Sale</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search invoice, customer…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 140 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom</option>
        </select>
        <select className="input" style={{ width: 140 }} value={payFilter} onChange={e => setPayFilter(e.target.value)}>
          <option value="all">All Payments</option>
          <option value="cash">Cash</option>
          <option value="qr">QR/UPI</option>
          <option value="card">Card</option>
        </select>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Sales", value: `₱${totalRevenue.toLocaleString("en-IN")}`, color: "#22C55E" },
          { label: "Transactions", value: filtered.filter(s => s.status === "completed").length, color: "#3B82F6" },
          { label: "Refunds", value: filtered.filter(s => s.status === "refunded").length, color: "#EF4444" },
          { label: "Avg. Order", value: `₱${Math.round(totalRevenue / Math.max(1, filtered.filter(s => s.status === "completed").length)).toLocaleString("en-IN")}`, color: "#F59E0B" },
        ].map(({ label, value, color }) => (
          <div key={label} className="metric-card" style={{ padding: 16 }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color }}>{value}</h3>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} onClick={() => setSelectedInvoice(s)}>
                <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>{s.id}</td>
                <td style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{s.date}</td>
                <td style={{ fontSize: 13, fontWeight: 500 }}>{s.customer}</td>
                <td style={{ fontSize: 13 }}>{s.items} items</td>
                <td style={{ fontWeight: 700 }}>₱{s.total.toLocaleString("en-IN")}</td>
                <td><span className={`badge ${s.payment === "cash" ? "badge-green" : s.payment === "qr" ? "badge-blue" : "badge-purple"}`}>{s.payment.toUpperCase()}</span></td>
                <td><span className={`badge ${s.status === "completed" ? "badge-green" : "badge-red"}`}>{s.status}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setSelectedInvoice(s)} title="View"><Eye size={15} /></button>
                    <button className="btn btn-ghost" style={{ padding: 6 }} title="Print"><Printer size={15} /></button>
                    {s.status === "completed" && <button className="btn btn-ghost" style={{ padding: 6, color: "#EF4444" }} title="Refund"><RotateCcw size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Invoice</h3>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setSelectedInvoice(null)}>✕</button>
            </div>

            <div style={{ background: "var(--muted)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "var(--primary)" }}>FreshMart</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted-foreground)" }}>Main Branch · GST: 27ABCDE1234F1Z5</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{selectedInvoice.id}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted-foreground)" }}>{selectedInvoice.date}</p>
                </div>
              </div>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 12 }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <div>
                  <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: 11 }}>Customer</p>
                  <p style={{ margin: "2px 0 0", fontWeight: 600 }}>{selectedInvoice.customer}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: 11 }}>Payment</p>
                  <span className={`badge ${selectedInvoice.payment === "cash" ? "badge-green" : "badge-blue"}`}>{selectedInvoice.payment.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <table style={{ marginBottom: 16 }}>
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
              <tbody>
                {[...Array(selectedInvoice.items)].map((_, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13 }}>Product {i + 1}</td>
                    <td style={{ fontSize: 13 }}>1</td>
                    <td style={{ fontSize: 13 }}>₱{Math.round(selectedInvoice.total / selectedInvoice.items)}</td>
                    <td style={{ fontSize: 13, fontWeight: 700 }}>₱{Math.round(selectedInvoice.total / selectedInvoice.items)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: "12px 16px", background: "var(--muted)", borderRadius: 10, marginBottom: 20 }}>
              {[["Subtotal", `₱${selectedInvoice.total - Math.round(selectedInvoice.total * 0.05)}`], ["GST (5%)", `₱${Math.round(selectedInvoice.total * 0.05)}`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: "var(--muted-foreground)" }}>{k}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                <span>Total</span><span style={{ color: "var(--primary)", fontSize: 18 }}>₱{selectedInvoice.total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}><Printer size={15} /> Print</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
