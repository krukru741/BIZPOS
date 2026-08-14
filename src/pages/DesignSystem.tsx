import { CheckCircle, AlertTriangle, Info, XCircle, Leaf } from "lucide-react";

export default function DesignSystem() {
  const colors = [
    { name: "Primary", hex: "#22C55E", cls: "badge-green" },
    { name: "Accent", hex: "#84CC16", cls: "badge-green" },
    { name: "Info", hex: "#3B82F6", cls: "badge-blue" },
    { name: "Warning", hex: "#F59E0B", cls: "badge-yellow" },
    { name: "Danger", hex: "#EF4444", cls: "badge-red" },
    { name: "Purple", hex: "#8B5CF6", cls: "badge-purple" },
    { name: "Background", hex: "#F8FAFC", cls: "badge-gray" },
    { name: "Dark BG", hex: "#0F172A", cls: "badge-gray" },
  ];

  const shadows = [
    { label: "xs", shadow: "0 1px 2px rgba(0,0,0,0.04)" },
    { label: "sm", shadow: "0 2px 4px rgba(0,0,0,0.06)" },
    { label: "md", shadow: "0 4px 8px rgba(0,0,0,0.08)" },
    { label: "lg", shadow: "0 8px 24px rgba(0,0,0,0.1)" },
    { label: "xl", shadow: "0 16px 48px rgba(0,0,0,0.14)" },
  ];

  const radii = [
    { label: "4px", r: 4 }, { label: "8px", r: 8 }, { label: "12px", r: 12 },
    { label: "16px", r: 16 }, { label: "24px", r: 24 }, { label: "999px (pill)", r: 999 },
  ];

  return (
    <div style={{ padding: 24 }} className="animate-fadeIn">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Design System</h1>
        <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>FreshMart POS — Visual language and component library</p>
      </div>

      {/* Colors */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Colors</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {colors.map(({ name, hex }) => (
            <div key={name} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ height: 80, background: hex }} />
              <div style={{ padding: "10px 12px" }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{name}</p>
                <p style={{ margin: 0, fontSize: 11, fontFamily: "monospace", color: "var(--muted-foreground)" }}>{hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Typography</h2>
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Display", size: 36, weight: 800, text: "FreshMart POS" },
            { label: "H1", size: 28, weight: 700, text: "Dashboard Overview" },
            { label: "H2", size: 22, weight: 700, text: "Today's Sales Report" },
            { label: "H3", size: 18, weight: 600, text: "Recent Transactions" },
            { label: "Body", size: 14, weight: 400, text: "All products are organized by category for quick access during checkout." },
            { label: "Caption", size: 12, weight: 500, text: "Last updated 5 minutes ago · GST included" },
            { label: "Mono", size: 13, weight: 500, text: "INV-2024-0842 · SKU-MILK-001 · ₱1,234.56", mono: true },
          ].map(({ label, size, weight, text, mono }) => (
            <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 16, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              <span style={{ minWidth: 60, fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
              <p style={{ margin: 0, fontSize: size, fontWeight: weight, fontFamily: mono ? "monospace" : "inherit", color: mono ? "var(--primary)" : "var(--foreground)" }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Badges */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Badges & Status</h2>
        <div className="card" style={{ padding: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span className="badge badge-green">In Stock</span>
          <span className="badge badge-yellow">Low Stock</span>
          <span className="badge badge-red">Out of Stock</span>
          <span className="badge badge-blue">QR/UPI</span>
          <span className="badge badge-purple">Card</span>
          <span className="badge badge-green">Completed</span>
          <span className="badge badge-red">Refunded</span>
          <span className="badge badge-orange">Partial</span>
          <span className="badge badge-gray">Inactive</span>
        </div>
      </section>

      {/* Buttons */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Buttons</h2>
        <div className="card" style={{ padding: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-primary"><Leaf size={14} /> Primary</button>
          <button className="btn btn-secondary"><Leaf size={14} /> Secondary</button>
          <button className="btn btn-ghost"><Leaf size={14} /> Ghost</button>
          <button className="btn btn-danger"><Leaf size={14} /> Danger</button>
          <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>Disabled</button>
          <button className="btn btn-primary" style={{ fontSize: 13, padding: "6px 12px" }}>Small</button>
          <button className="btn btn-primary" style={{ fontSize: 16, padding: "12px 24px" }}>Large</button>
        </div>
      </section>

      {/* Inputs */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Inputs</h2>
        <div className="card" style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label className="form-label">Default Input</label><input className="input" placeholder="Enter text…" /></div>
          <div><label className="form-label">Focused State</label><input className="input" defaultValue="Focused" style={{ borderColor: "var(--primary)", boxShadow: "0 0 0 3px rgba(34,197,94,0.12)" }} /></div>
          <div><label className="form-label">Select</label><select className="input"><option>Option 1</option><option>Option 2</option></select></div>
          <div><label className="form-label">Number</label><input className="input" type="number" defaultValue="42" /></div>
          <div style={{ gridColumn: "1/-1" }}><label className="form-label">Textarea</label><textarea className="input" defaultValue="Multi-line input for descriptions and notes." style={{ minHeight: 72 }} /></div>
        </div>
      </section>

      {/* Cards */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Cards</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div className="metric-card">
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Metric Card</p>
            <h3 style={{ margin: "4px 0 4px", fontSize: 28, fontWeight: 800, color: "#22C55E" }}>₱38,420</h3>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>+12.3% vs yesterday</p>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Standard Card</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>A basic card component with border, radius, and subtle shadow.</p>
          </div>
          <div className="pos-product-card">
            <div style={{ fontSize: 32, textAlign: "center" }}>🥛</div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>Organic Whole Milk</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--muted-foreground)" }}>Amul · Dairy</p>
            <span style={{ fontWeight: 800, fontSize: 15, color: "var(--primary)" }}>₱55</span>
          </div>
        </div>
      </section>

      {/* Shadows */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Shadows</h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {shadows.map(({ label, shadow }) => (
            <div key={label} style={{ width: 100, height: 80, background: "var(--card)", borderRadius: 12, boxShadow: shadow, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)" }}>shadow-{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Border radius */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Border Radius</h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {radii.map(({ label, r }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 72, height: 72, background: "var(--primary)", borderRadius: r, opacity: 0.85 }} />
              <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Grid System (12-col)</h2>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 4 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ height: 32, background: "rgba(34,197,94,0.15)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--primary)" }}>{i + 1}</div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {[[3, 9], [4, 8], [6, 6], [4, 4, 4], [3, 3, 3, 3]].map((cols, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: cols.map(c => `${c}fr`).join(" "), gap: 4 }}>
                {cols.map((c, ci) => (
                  <div key={ci} style={{ height: 24, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--primary)" }}>{c}/12</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
