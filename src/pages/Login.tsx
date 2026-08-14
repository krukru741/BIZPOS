import { useState } from "react";
import { Leaf, Eye, EyeOff, ShieldCheck, User } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<"admin" | "cashier">("admin");
  const [email, setEmail] = useState("admin@freshmart.in");
  const [password, setPassword] = useState("password");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--background)" }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: "linear-gradient(135deg,#0F172A 0%,#1E3A2F 50%,#14532D 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, position: "relative", overflow: "hidden" }}>
        {/* Background decoration */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 200 + i * 80,
            height: 200 + i * 80,
            border: "1px solid rgba(34,197,94,0.08)",
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }} />
        ))}

        <div style={{ position: "relative", textAlign: "center", maxWidth: 420 }}>
          <div style={{ width: 72, height: 72, background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
            <Leaf size={36} color="#22C55E" />
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#F8FAFC", margin: "0 0 12px", letterSpacing: -1 }}>FreshMart POS</h1>
          <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.6, margin: "0 0 40px" }}>
            Complete grocery store management. Billing, inventory, reports — all in one place.
          </p>

          {/* Feature list */}
          {["Lightning-fast POS checkout", "Real-time inventory tracking", "GST-compliant invoices", "Detailed sales reports"].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 20, height: 20, background: "rgba(34,197,94,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 6, height: 6, background: "#22C55E", borderRadius: "50%" }} />
              </div>
              <span style={{ color: "#CBD5E1", fontSize: 14 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--foreground)", margin: "0 0 6px" }}>Welcome back</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: 14, margin: 0 }}>Sign in to your store dashboard</p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Sign in as</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {(["admin", "cashier"] as const).map((r) => (
                <button key={r} onClick={() => setRole(r)} style={{
                  padding: "12px 16px",
                  border: `2px solid ${role === r ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 10,
                  background: role === r ? "rgba(34,197,94,0.06)" : "var(--card)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.15s ease",
                }}>
                  {r === "admin" ? <ShieldCheck size={20} color={role === r ? "var(--primary)" : "var(--muted-foreground)"} /> : <User size={20} color={role === r ? "var(--primary)" : "var(--muted-foreground)"} />}
                  <span style={{ fontWeight: 600, fontSize: 14, color: role === r ? "var(--primary)" : "var(--foreground)", textTransform: "capitalize" }}>{r}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@freshmart.in" />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <button className="btn btn-ghost" style={{ padding: 0, fontSize: 13, color: "var(--primary)", height: "auto" }}>Forgot password?</button>
            </div>
            <div style={{ position: "relative" }}>
              <input className="input" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight: 42 }} />
              <button onClick={() => setShowPass(!showPass)} className="btn btn-ghost" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", padding: 4, minWidth: 0, height: "auto" }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--primary)", cursor: "pointer" }} />
            <label htmlFor="remember" style={{ fontSize: 14, color: "var(--muted-foreground)", cursor: "pointer" }}>Remember me for 30 days</label>
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px 16px", fontSize: 15, fontWeight: 700 }} onClick={handleLogin} disabled={loading}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                Signing in…
              </div>
            ) : "Sign in"}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--muted-foreground)" }}>
            Demo: <span style={{ color: "var(--primary)", fontWeight: 600 }}>any credentials work</span>
          </p>
        </div>
      </div>
    </div>
  );
}
