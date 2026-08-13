import { useState } from "react";
import { Save, Upload, Sun, Moon } from "lucide-react";

interface SettingsProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Settings({ darkMode, onToggleDark }: SettingsProps) {
  const [tab, setTab] = useState("store");
  const [store, setStore] = useState({
    name: "FreshMart", tagline: "Fresh Everyday", phone: "+91 98765 43210",
    email: "contact@freshmart.in", address: "123 MG Road, Bangalore - 560001",
    gst: "27ABCDE1234F1Z5", currency: "INR",
  });

  const tabs = [
    { id: "store", label: "Store Profile" },
    { id: "receipt", label: "Receipt" },
    { id: "tax", label: "Tax Settings" },
    { id: "theme", label: "Theme" },
  ];

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div className="section-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>Manage store configuration</p>
        </div>
        <button className="btn btn-primary"><Save size={15} /> Save Changes</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, alignItems: "start" }}>
        {/* Sidebar tabs */}
        <div className="card" style={{ padding: 8 }}>
          {tabs.map(t => (
            <button key={t.id} className={`sidebar-link ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)} style={{ marginBottom: 2 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === "store" && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>Store Profile</h3>

              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, background: "linear-gradient(135deg,#22C55E,#16A34A)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#fff" }}>F</div>
                <div>
                  <p style={{ margin: "0 0 6px", fontWeight: 600 }}>Store Logo</p>
                  <button className="btn btn-secondary" style={{ fontSize: 13 }}><Upload size={14} /> Upload Logo</button>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted-foreground)" }}>PNG or SVG, max 2MB</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Store Name", key: "name" as const },
                  { label: "Tagline", key: "tagline" as const },
                  { label: "Phone", key: "phone" as const },
                  { label: "Email", key: "email" as const },
                  { label: "GST Number", key: "gst" as const },
                  { label: "Currency", key: "currency" as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="form-label">{label}</label>
                    <input className="input" value={store[key]} onChange={e => setStore(s => ({ ...s, [key]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Address</label>
                  <textarea className="input" style={{ minHeight: 72 }} value={store.address} onChange={e => setStore(s => ({ ...s, address: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {tab === "receipt" && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>Receipt Template</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Header Text", default: "Thank you for shopping at FreshMart!" },
                    { label: "Footer Text", default: "Visit us again. Save & Exchange within 7 days." },
                    { label: "Custom Message", default: "" },
                  ].map(({ label, default: def }) => (
                    <div key={label}><label className="form-label">{label}</label><input className="input" defaultValue={def} /></div>
                  ))}
                  {[
                    { label: "Show Logo", def: true },
                    { label: "Show GST Number", def: true },
                    { label: "Show Barcode", def: false },
                    { label: "Show Thank You Message", def: true },
                  ].map(({ label, def }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                      <input type="checkbox" defaultChecked={def} style={{ width: 18, height: 18, accentColor: "var(--primary)", cursor: "pointer" }} />
                    </div>
                  ))}
                </div>

                {/* Receipt preview */}
                <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 20, fontFamily: "monospace", fontSize: 12, color: "#111", maxHeight: 400, overflow: "hidden" }}>
                  <p style={{ textAlign: "center", fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>FRESHMART</p>
                  <p style={{ textAlign: "center", color: "#555", margin: "0 0 2px" }}>123 MG Road, Bangalore</p>
                  <p style={{ textAlign: "center", color: "#555", margin: "0 0 12px" }}>GST: 27ABCDE1234F1Z5</p>
                  <p style={{ borderTop: "1px dashed #ccc", margin: "0 0 8px", paddingTop: 8 }}>INV-2024-0842</p>
                  <p style={{ margin: "0 0 8px" }}>Date: 15/01/2024 14:32</p>
                  <div style={{ borderTop: "1px dashed #ccc", paddingTop: 8, marginBottom: 8 }}>
                    {["Organic Milk 2x₹55=₹110", "Sourdough 1x₹55=₹55", "Brown Rice 1x₹279=₹279"].map(i => <p key={i} style={{ margin: "0 0 4px" }}>{i}</p>)}
                  </div>
                  <div style={{ borderTop: "1px dashed #ccc", paddingTop: 8 }}>
                    <p style={{ margin: "0 0 2px" }}>Subtotal: ₹444</p>
                    <p style={{ margin: "0 0 2px" }}>GST (5%): ₹22</p>
                    <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Total: ₹466</p>
                  </div>
                  <p style={{ textAlign: "center", fontSize: 10, color: "#555" }}>Thank you for shopping!</p>
                </div>
              </div>
            </div>
          )}

          {tab === "tax" && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>Tax Settings</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--muted)", borderRadius: 10 }}>
                  <div><p style={{ margin: 0, fontWeight: 600 }}>GST Enabled</p><p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>Apply GST to all applicable products</p></div>
                  <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: "var(--primary)" }} />
                </div>
                <div><label className="form-label">GSTIN</label><input className="input" defaultValue="27ABCDE1234F1Z5" /></div>
                <div><label className="form-label">Default Tax Rate (%)</label><input className="input" type="number" defaultValue="5" /></div>
                <h4 style={{ margin: "8px 0 4px" }}>Tax Slabs</h4>
                {[0, 5, 12, 18, 28].map(rate => (
                  <div key={rate} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", border: "1px solid var(--border)", borderRadius: 8 }}>
                    <span style={{ fontWeight: 600 }}>{rate}% GST</span>
                    <input type="checkbox" defaultChecked={rate > 0} style={{ width: 18, height: 18, accentColor: "var(--primary)" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "theme" && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ margin: "0 0 20px", fontWeight: 700 }}>Appearance</h3>
              <div style={{ display: "flex", gap: 14 }}>
                {[
                  { label: "Light", icon: <Sun size={28} color="#F59E0B" />, active: !darkMode },
                  { label: "Dark", icon: <Moon size={28} color="#6366F1" />, active: darkMode },
                ].map(({ label, icon, active }) => (
                  <button key={label} onClick={onToggleDark} style={{
                    flex: 1, padding: 24, border: `2px solid ${active ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: 14, background: active ? "rgba(34,197,94,0.06)" : "var(--card)",
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                  }}>
                    {icon}
                    <span style={{ fontWeight: 700, fontSize: 15, color: active ? "var(--primary)" : "var(--foreground)" }}>{label}</span>
                    {active && <span className="badge badge-green">Active</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
