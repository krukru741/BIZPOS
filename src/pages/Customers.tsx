import { useState } from "react";
import { Search, Phone, Mail, Eye, UserPlus } from "lucide-react";
import { customers } from "../data/mockData";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof customers[0] | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div className="section-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary"><UserPlus size={15} /> Add Customer</button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
        <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
        <input className="input" style={{ paddingLeft: 34 }} placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20, alignItems: "start" }}>
        {/* Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Total Purchases</th>
                <th>Orders</th>
                <th>Outstanding</th>
                <th>Last Visit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={() => setSelected(c)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#22C55E,#16A34A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 14, flexShrink: 0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 13 }}>{c.phone}</span>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{c.email}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--primary)" }}>₱{c.totalPurchases.toLocaleString("en-IN")}</td>
                  <td style={{ fontSize: 13 }}>{c.totalOrders}</td>
                  <td>
                    {c.outstanding > 0
                      ? <span className="badge badge-red">₱{c.outstanding.toLocaleString("en-IN")}</span>
                      : <span className="badge badge-green">Clear</span>}
                  </td>
                  <td style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{c.lastVisit}</td>
                  <td><button className="btn btn-ghost" style={{ padding: 6 }}><Eye size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="animate-slideIn">
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Customer Profile</h3>
                <button className="btn btn-ghost" style={{ padding: 4, fontSize: 12 }} onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#22C55E,#16A34A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 24 }}>{selected.name.charAt(0)}</div>
                <h3 style={{ margin: 0, fontWeight: 800 }}>{selected.name}</h3>
                {selected.outstanding > 0 && <span className="badge badge-red">Outstanding: ₱{selected.outstanding.toLocaleString("en-IN")}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><Phone size={14} color="var(--muted-foreground)" />{selected.phone}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}><Mail size={14} color="var(--muted-foreground)" />{selected.email}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Total Spent", value: `₱${selected.totalPurchases.toLocaleString("en-IN")}`, color: "#22C55E" },
                { label: "Orders", value: selected.totalOrders, color: "#3B82F6" },
              ].map(({ label, value, color }) => (
                <div key={label} className="metric-card" style={{ padding: 14 }}>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{label}</p>
                  <p style={{ margin: "4px 0 0", fontWeight: 800, fontSize: 18, color }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700 }}>Recent Purchases</h3>
              {[
                { date: "15 Jan", amount: 847, items: 5 },
                { date: "10 Jan", amount: 1243, items: 8 },
                { date: "05 Jan", amount: 320, items: 3 },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{p.items} items</p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--muted-foreground)" }}>{p.date}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--primary)" }}>₱{p.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
